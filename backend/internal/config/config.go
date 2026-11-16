package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	DatabaseURL       string
	FrontendDir       string
	AllowedOrigins    []string
	JWTSecret         string
	AdminSessionHours time.Duration
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	port := getenv("PORT", "8080")
	frontendDir := getenv("FRONTEND_DIR", "./frontend")
	dbURL := os.Getenv("DATABASE_URL")
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-insecure-change-me"
	}
	hours, _ := strconv.Atoi(getenv("ADMIN_SESSION_HOURS", "24"))
	if hours <= 0 {
		hours = 24
	}
	origins := splitAndTrim(getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080"))

	return &Config{
		Port:              port,
		DatabaseURL:       dbURL,
		FrontendDir:       frontendDir,
		AllowedOrigins:    origins,
		JWTSecret:         jwtSecret,
		AdminSessionHours: time.Duration(hours) * time.Hour,
	}, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func splitAndTrim(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
