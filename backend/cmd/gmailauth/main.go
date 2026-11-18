package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	clientID := flag.String("client-id", os.Getenv("GMAIL_CLIENT_ID"), "Google OAuth client ID")
	clientSecret := flag.String("client-secret", os.Getenv("GMAIL_CLIENT_SECRET"), "Google OAuth client secret")
	redirectURI := flag.String("redirect-uri", getenv("GMAIL_REDIRECT_URI", "http://localhost:8080/oauth2/callback"), "OAuth redirect URI registered with Google")
	flag.Parse()
	if *clientID == "" || *clientSecret == "" {
		log.Fatal("client-id and client-secret are required (flags or GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET env vars)")
	}
	u, err := url.Parse(*redirectURI)
	if err != nil || u.Path == "" || (u.Hostname() != "localhost" && u.Hostname() != "127.0.0.1") {
		log.Fatalf("redirect-uri must be a localhost URL with a path, got %q", *redirectURI)
	}
	port := u.Port()
	if port == "" {
		port = "8080"
	}
	stateBytes := make([]byte, 16)
	if _, err := rand.Read(stateBytes); err != nil {
		log.Fatalf("generate state: %v", err)
	}
	state := hex.EncodeToString(stateBytes)
	authURL := "https://accounts.google.com/o/oauth2/v2/auth?" + url.Values{
		"client_id":     {*clientID},
		"redirect_uri":  {*redirectURI},
		"response_type": {"code"},
		"scope":         {"https://www.googleapis.com/auth/gmail.send"},
		"access_type":   {"offline"},
		"prompt":        {"consent"},
		"state":         {state},
	}.Encode()
	listener, err := net.Listen("tcp", "127.0.0.1:"+port)
	if err != nil {
		log.Fatalf("listen on %s: %v", port, err)
	}
	codeCh := make(chan string, 1)
	errCh := make(chan error, 1)
	mux := http.NewServeMux()
	mux.HandleFunc(u.Path, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		if r.URL.Query().Get("state") != state {
			http.Error(w, "invalid OAuth state", http.StatusBadRequest)
			errCh <- fmt.Errorf("invalid OAuth state")
			return
		}
		code := r.URL.Query().Get("code")
		if code == "" {
			http.Error(w, "missing OAuth code", http.StatusBadRequest)
			errCh <- fmt.Errorf("missing OAuth code")
			return
		}
		_, _ = w.Write([]byte("Authorization complete. You can close this window."))
		codeCh <- code
	})
	server := &http.Server{Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		_ = server.Serve(listener)
	}()
	defer server.Close()
	log.Printf("Open this URL in your browser:\n%s", authURL)
	var code string
	select {
	case code = <-codeCh:
	case err := <-errCh:
		log.Fatalf("oauth callback: %v", err)
	case <-time.After(5 * time.Minute):
		log.Fatal("timed out waiting for OAuth callback")
	}
	refreshToken, err := exchangeCode(&http.Client{Timeout: 10 * time.Second}, *clientID, *clientSecret, *redirectURI, code)
	if err != nil {
		log.Fatalf("exchange code: %v", err)
	}
	fmt.Println("Add this value to Render as GMAIL_REFRESH_TOKEN:")
	fmt.Printf("GMAIL_REFRESH_TOKEN=%s\n", refreshToken)
}

func exchangeCode(client *http.Client, clientID, clientSecret, redirectURI, code string) (string, error) {
	form := url.Values{
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"redirect_uri":  {redirectURI},
		"code":          {code},
		"grant_type":    {"authorization_code"},
	}
	resp, err := client.PostForm("https://oauth2.googleapis.com/token", form)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return "", err
	}
	var result struct {
		RefreshToken     string `json:"refresh_token"`
		Error            string `json:"error"`
		ErrorDescription string `json:"error_description"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("decode token response: %w", err)
	}
	if result.RefreshToken == "" {
		return "", fmt.Errorf("no refresh token returned (status=%d error=%s description=%s)", resp.StatusCode, result.Error, result.ErrorDescription)
	}
	return result.RefreshToken, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
