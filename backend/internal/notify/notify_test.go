package notify

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/mchemere/gifted-hands/backend/internal/config"
	"github.com/mchemere/gifted-hands/backend/internal/models"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) {
	return f(r)
}

func TestSendGmail(t *testing.T) {
	var tokenRequested, sendRequested bool
	var capturedAuth, capturedURL string
	var capturedRaw string

	mockClient := &http.Client{
		Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
			if r.URL.String() == "https://oauth2.googleapis.com/token" {
				tokenRequested = true
				res := map[string]string{
					"access_token": "mock-access-token-12345",
					"token_type":   "Bearer",
				}
				body, _ := json.Marshal(res)
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       io.NopCloser(strings.NewReader(string(body))),
					Header:     make(http.Header),
				}, nil
			}

			if strings.Contains(r.URL.Path, "/messages/send") {
				sendRequested = true
				capturedURL = r.URL.String()
				capturedAuth = r.Header.Get("Authorization")

				var payload struct {
					Raw string `json:"raw"`
				}
				_ = json.NewDecoder(r.Body).Decode(&payload)
				capturedRaw = payload.Raw

				res := map[string]string{
					"id":       "msg-id-123",
					"threadId": "thread-id-123",
				}
				body, _ := json.Marshal(res)
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       io.NopCloser(strings.NewReader(string(body))),
					Header:     make(http.Header),
				}, nil
			}

			return &http.Response{
				StatusCode: http.StatusNotFound,
				Body:       io.NopCloser(strings.NewReader("not found")),
				Header:     make(http.Header),
			}, nil
		}),
	}

	notifier := &Notifier{
		cfg: &config.Config{
			GmailClientID:     "test-client-id",
			GmailClientSecret: "test-client-secret",
			GmailRefreshToken: "test-refresh-token",
			NotifyEmail:       "owner@example.com",
			SMTPFrom:          "owner@example.com",
			SMTPHost:          "smtp.gmail.com",
		},
		client: mockClient,
	}

	err := notifier.sendGmail("<test@message.id>", []byte("Subject: Test\r\n\r\nHello World"))
	if err != nil {
		t.Fatalf("sendGmail failed: %v", err)
	}

	if !tokenRequested {
		t.Error("expected oauth token request to be made")
	}
	if !sendRequested {
		t.Error("expected messages/send request to be made")
	}
	if capturedURL != "https://gmail.googleapis.com/gmail/v1/users/me/messages/send" {
		t.Errorf("unexpected URL: %s", capturedURL)
	}
	if capturedAuth != "Bearer mock-access-token-12345" {
		t.Errorf("unexpected Authorization header: %s", capturedAuth)
	}

	decoded, err := base64.URLEncoding.DecodeString(capturedRaw)
	if err != nil {
		t.Fatalf("failed to decode base64 raw message: %v", err)
	}
	if !strings.Contains(string(decoded), "Hello World") {
		t.Errorf("expected decoded raw to contain 'Hello World', got %q", string(decoded))
	}
}

func TestBookingText(t *testing.T) {
	msg := "Please be gentle"
	email := "cust@example.com"
	b := models.Booking{
		ID:            42,
		CustomerName:  "Grace",
		PhoneNumber:   "+254700000000",
		Email:         &email,
		ServiceName:   "Knotless Braids",
		PreferredDate: "2026-12-01",
		PreferredTime: "10:00",
		Message:       &msg,
	}

	text := bookingText(b)
	if !strings.Contains(text, "Grace") || !strings.Contains(text, "Knotless Braids") || !strings.Contains(text, "Please be gentle") {
		t.Errorf("bookingText missing expected fields: %s", text)
	}
}
