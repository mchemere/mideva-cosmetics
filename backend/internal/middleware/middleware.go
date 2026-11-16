package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/mchemere/gifted-hands/backend/internal/auth"
	"github.com/mchemere/gifted-hands/backend/internal/util"
)

type ctxKey string

const AdminKey ctxKey = "admin"

func CORS(allowed []string, next http.Handler) http.Handler {
	allowedSet := map[string]bool{}
	for _, o := range allowed {
		allowedSet[o] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && allowedSet[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func RequireAdmin(secret string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := r.Header.Get("Authorization")
		if !strings.HasPrefix(h, "Bearer ") {
			util.Error(w, http.StatusUnauthorized, "missing or invalid authorization header")
			return
		}
		token := strings.TrimPrefix(h, "Bearer ")
		claims, err := auth.ParseToken(token, secret)
		if err != nil {
			util.Error(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		ctx := context.WithValue(r.Context(), AdminKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func Chain(h http.Handler, m ...func(http.Handler) http.Handler) http.Handler {
	for i := len(m) - 1; i >= 0; i-- {
		h = m[i](h)
	}
	return h
}
