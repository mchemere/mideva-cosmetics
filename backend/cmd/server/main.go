package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/mchemere/gifted-hands/backend/internal/config"
	"github.com/mchemere/gifted-hands/backend/internal/database"
	"github.com/mchemere/gifted-hands/backend/internal/handlers"
	"github.com/mchemere/gifted-hands/backend/internal/middleware"
	"github.com/mchemere/gifted-hands/backend/internal/notify"
	"github.com/mchemere/gifted-hands/backend/internal/repository"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer db.Close()

	api := &handlers.API{
		Cfg:       cfg,
		Admins:    &repository.AdminRepository{DB: db},
		Services:  &repository.ServiceRepository{DB: db},
		Bookings:  &repository.BookingRepository{DB: db},
		Inquiries: &repository.InquiryRepository{DB: db},
		Notifier:  notify.New(cfg),
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", api.Health)
	mux.HandleFunc("GET /api/services", api.ListServices)
	mux.HandleFunc("POST /api/bookings", api.CreateBooking)
	mux.HandleFunc("POST /api/inquiries", api.CreateInquiry)
	mux.HandleFunc("POST /api/admin/login", api.AdminLogin)

	adminAuth := func(h http.HandlerFunc) http.Handler {
		return middleware.RequireAdmin(cfg.JWTSecret, h)
	}
	mux.Handle("GET /api/admin/bookings", adminAuth(api.AdminListBookings))
	mux.Handle("PATCH /api/admin/bookings/{id}", adminAuth(api.AdminUpdateBookingStatus))
	mux.Handle("DELETE /api/admin/bookings/{id}", adminAuth(api.AdminDeleteBooking))
	mux.Handle("GET /api/admin/inquiries", adminAuth(api.AdminListInquiries))
	mux.Handle("GET /api/admin/services", adminAuth(api.AdminListServices))
	mux.Handle("POST /api/admin/services", adminAuth(api.AdminCreateService))
	mux.Handle("PUT /api/admin/services/{id}", adminAuth(api.AdminUpdateService))
	mux.Handle("DELETE /api/admin/services/{id}", adminAuth(api.AdminDeleteService))

	// Serve frontend static files and HTML pages
	frontendDir := cfg.FrontendDir
	fileServer := http.FileServer(http.Dir(frontendDir))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		clean := filepath.Clean(r.URL.Path)
		path := filepath.Join(frontendDir, clean)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			fileServer.ServeHTTP(w, r)
			return
		}
		// try .html for clean routes
		if !strings.Contains(filepath.Base(clean), ".") {
			htmlPath := filepath.Join(frontendDir, strings.TrimPrefix(clean, "/")+".html")
			if _, err := os.Stat(htmlPath); err == nil {
				http.ServeFile(w, r, htmlPath)
				return
			}
		}
		// admin pages folder
		if strings.HasPrefix(clean, "/admin") {
			adminPath := filepath.Join(frontendDir, strings.TrimPrefix(clean, "/"))
			if info, err := os.Stat(adminPath); err == nil && !info.IsDir() {
				http.ServeFile(w, r, adminPath)
				return
			}
			if _, err := os.Stat(adminPath + ".html"); err == nil {
				http.ServeFile(w, r, adminPath+".html")
				return
			}
		}
		index := filepath.Join(frontendDir, "index.html")
		if _, err := os.Stat(index); err == nil {
			http.ServeFile(w, r, index)
			return
		}
		http.NotFound(w, r)
	})

	handler := middleware.CORS(cfg.AllowedOrigins, mux)
	addr := ":" + cfg.Port
	log.Printf("Gifted Hands server starting on %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}
