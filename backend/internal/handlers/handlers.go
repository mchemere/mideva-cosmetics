package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/mchemere/gifted-hands/backend/internal/auth"
	"github.com/mchemere/gifted-hands/backend/internal/config"
	"github.com/mchemere/gifted-hands/backend/internal/models"
	"github.com/mchemere/gifted-hands/backend/internal/notify"
	"github.com/mchemere/gifted-hands/backend/internal/repository"
	"github.com/mchemere/gifted-hands/backend/internal/util"
)

type API struct {
	Cfg       *config.Config
	Admins    *repository.AdminRepository
	Services  *repository.ServiceRepository
	Bookings  *repository.BookingRepository
	Inquiries *repository.InquiryRepository
	Notifier  *notify.Notifier
}

func (a *API) Health(w http.ResponseWriter, r *http.Request) {
	provider := "disabled"
	if a.Cfg != nil {
		if a.Cfg.GmailClientID != "" && a.Cfg.GmailClientSecret != "" && a.Cfg.GmailRefreshToken != "" {
			provider = "gmail"
		} else if a.Cfg.SMTPUser != "" && a.Cfg.SMTPPass != "" {
			provider = "smtp"
		}
	}
	util.JSON(w, http.StatusOK, map[string]string{"status": "ok", "email_provider": provider})
}

// Public: list active services
func (a *API) ListServices(w http.ResponseWriter, r *http.Request) {
	items, err := a.Services.ListActive(r.Context())
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to load services")
		return
	}
	util.JSON(w, http.StatusOK, items)
}

type createBookingReq struct {
	CustomerName  string  `json:"customer_name"`
	PhoneNumber   string  `json:"phone_number"`
	Email         *string `json:"email"`
	ServiceID     *int    `json:"service_id"`
	ServiceName   string  `json:"service_name"`
	PreferredDate string  `json:"preferred_date"`
	PreferredTime string  `json:"preferred_time"`
	Message       *string `json:"message"`
}

func (a *API) CreateBooking(w http.ResponseWriter, r *http.Request) {
	var req createBookingReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.CustomerName = util.Clean(req.CustomerName)
	req.PhoneNumber = util.Clean(req.PhoneNumber)
	req.ServiceName = util.Clean(req.ServiceName)
	req.PreferredDate = util.Clean(req.PreferredDate)
	req.PreferredTime = util.Clean(req.PreferredTime)
	if req.Email != nil {
		e := util.Clean(*req.Email)
		req.Email = &e
	}
	if req.Message != nil {
		m := util.Clean(*req.Message)
		req.Message = &m
	}
	if req.CustomerName == "" || !util.ValidPhone(req.PhoneNumber) || req.ServiceName == "" || req.PreferredDate == "" || req.PreferredTime == "" {
		util.Error(w, http.StatusBadRequest, "please provide valid name, phone number, service, date and time")
		return
	}
	if req.Email != nil && *req.Email != "" && !util.ValidEmail(*req.Email) {
		util.Error(w, http.StatusBadRequest, "please provide a valid email address")
		return
	}
	if _, err := time.Parse("2006-01-02", req.PreferredDate); err != nil {
		util.Error(w, http.StatusBadRequest, "invalid preferred date")
		return
	}
	b := &models.Booking{
		CustomerName: req.CustomerName, PhoneNumber: req.PhoneNumber, Email: req.Email,
		ServiceID: req.ServiceID, ServiceName: req.ServiceName,
		PreferredDate: req.PreferredDate, PreferredTime: req.PreferredTime, Message: req.Message,
	}
	if err := a.Bookings.Create(r.Context(), b); err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to submit booking request")
		return
	}
	if a.Notifier != nil {
		a.Notifier.Booking(*b)
	}
	util.JSON(w, http.StatusCreated, map[string]any{"message": "Booking request received. We will contact you to confirm.", "booking": b})
}

type inquiryReq struct {
	Name        string  `json:"name"`
	PhoneNumber *string `json:"phone_number"`
	Email       *string `json:"email"`
	Subject     *string `json:"subject"`
	Message     string  `json:"message"`
}

func (a *API) CreateInquiry(w http.ResponseWriter, r *http.Request) {
	var req inquiryReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Name = util.Clean(req.Name)
	req.Message = util.Clean(req.Message)
	if req.PhoneNumber != nil {
		v := util.Clean(*req.PhoneNumber)
		req.PhoneNumber = &v
	}
	if req.Email != nil {
		v := util.Clean(*req.Email)
		req.Email = &v
	}
	if req.Subject != nil {
		v := util.Clean(*req.Subject)
		req.Subject = &v
	}
	if req.Name == "" || req.Message == "" {
		util.Error(w, http.StatusBadRequest, "name and message are required")
		return
	}
	if req.Email != nil && *req.Email != "" && !util.ValidEmail(*req.Email) {
		util.Error(w, http.StatusBadRequest, "please provide a valid email address")
		return
	}
	if req.PhoneNumber != nil && *req.PhoneNumber != "" && !util.ValidPhone(*req.PhoneNumber) {
		util.Error(w, http.StatusBadRequest, "please provide a valid phone number")
		return
	}
	in := &models.Inquiry{Name: req.Name, PhoneNumber: req.PhoneNumber, Email: req.Email, Subject: req.Subject, Message: req.Message}
	if err := a.Inquiries.Create(r.Context(), in); err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to submit inquiry")
		return
	}
	util.JSON(w, http.StatusCreated, map[string]any{"message": "Thank you for contacting Gifted Hands. We will get back to you soon."})
}

// Admin auth
type loginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (a *API) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Username = util.Clean(req.Username)
	if req.Username == "" || req.Password == "" {
		util.Error(w, http.StatusBadRequest, "username and password are required")
		return
	}
	admin, err := a.Admins.GetByUsername(r.Context(), req.Username)
	if err != nil {
		util.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err := auth.CheckPassword(admin.PasswordHash, req.Password); err != nil {
		util.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	token, err := auth.GenerateToken(admin.ID, admin.Username, a.Cfg.JWTSecret, a.Cfg.AdminSessionHours)
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	util.JSON(w, http.StatusOK, map[string]any{"token": token, "admin": map[string]any{"id": admin.ID, "username": admin.Username, "full_name": admin.FullName}})
}

func (a *API) AdminListBookings(w http.ResponseWriter, r *http.Request) {
	items, err := a.Bookings.List(r.Context())
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to load bookings")
		return
	}
	util.JSON(w, http.StatusOK, items)
}

type statusReq struct {
	Status     string  `json:"status"`
	AdminNotes *string `json:"admin_notes"`
}

func (a *API) AdminUpdateBookingStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.Error(w, http.StatusBadRequest, "invalid booking id")
		return
	}
	var req statusReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	req.Status = strings.ToLower(util.Clean(req.Status))
	switch req.Status {
	case "pending", "approved", "rejected", "completed", "cancelled":
	default:
		util.Error(w, http.StatusBadRequest, "invalid status")
		return
	}
	if err := a.Bookings.UpdateStatus(r.Context(), id, req.Status, req.AdminNotes); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.Error(w, http.StatusNotFound, "booking not found")
			return
		}
		util.Error(w, http.StatusInternalServerError, "failed to update booking")
		return
	}
	util.JSON(w, http.StatusOK, map[string]string{"message": "booking updated"})
}

func (a *API) AdminDeleteBooking(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.Error(w, http.StatusBadRequest, "invalid booking id")
		return
	}
	if err := a.Bookings.Delete(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.Error(w, http.StatusNotFound, "booking not found")
			return
		}
		util.Error(w, http.StatusInternalServerError, "failed to delete booking")
		return
	}
	util.JSON(w, http.StatusOK, map[string]string{"message": "booking deleted"})
}

func (a *API) AdminListInquiries(w http.ResponseWriter, r *http.Request) {
	items, err := a.Inquiries.List(r.Context())
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to load inquiries")
		return
	}
	util.JSON(w, http.StatusOK, items)
}

func (a *API) AdminListServices(w http.ResponseWriter, r *http.Request) {
	items, err := a.Services.ListAll(r.Context())
	if err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to load services")
		return
	}
	util.JSON(w, http.StatusOK, items)
}

type serviceReq struct {
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Category      string `json:"category"`
	Description   string `json:"description"`
	PriceLabel    string `json:"price_label"`
	DurationLabel string `json:"duration_label"`
	ImagePath     string `json:"image_path"`
	IsActive      *bool  `json:"is_active"`
}

func (a *API) AdminCreateService(w http.ResponseWriter, r *http.Request) {
	var req serviceReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	s := models.Service{Name: util.Clean(req.Name), Slug: util.Clean(req.Slug), Category: util.Clean(req.Category), Description: util.Clean(req.Description), PriceLabel: util.Clean(req.PriceLabel), DurationLabel: util.Clean(req.DurationLabel), ImagePath: util.Clean(req.ImagePath), IsActive: true}
	if req.IsActive != nil {
		s.IsActive = *req.IsActive
	}
	if s.Name == "" || s.Slug == "" || s.Category == "" || s.Description == "" || s.ImagePath == "" {
		util.Error(w, http.StatusBadRequest, "name, slug, category, description and image_path are required")
		return
	}
	if s.PriceLabel == "" {
		s.PriceLabel = "Price on request"
	}
	if s.DurationLabel == "" {
		s.DurationLabel = "Duration on consultation"
	}
	if err := a.Services.Create(r.Context(), &s); err != nil {
		util.Error(w, http.StatusInternalServerError, "failed to create service")
		return
	}
	util.JSON(w, http.StatusCreated, s)
}

func (a *API) AdminUpdateService(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.Error(w, http.StatusBadRequest, "invalid service id")
		return
	}
	var req serviceReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	s := models.Service{ID: id, Name: util.Clean(req.Name), Slug: util.Clean(req.Slug), Category: util.Clean(req.Category), Description: util.Clean(req.Description), PriceLabel: util.Clean(req.PriceLabel), DurationLabel: util.Clean(req.DurationLabel), ImagePath: util.Clean(req.ImagePath), IsActive: true}
	if req.IsActive != nil {
		s.IsActive = *req.IsActive
	}
	if s.Name == "" || s.Slug == "" || s.Category == "" || s.Description == "" || s.ImagePath == "" {
		util.Error(w, http.StatusBadRequest, "name, slug, category, description and image_path are required")
		return
	}
	if s.PriceLabel == "" {
		s.PriceLabel = "Price on request"
	}
	if s.DurationLabel == "" {
		s.DurationLabel = "Duration on consultation"
	}
	if err := a.Services.Update(r.Context(), &s); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.Error(w, http.StatusNotFound, "service not found")
			return
		}
		util.Error(w, http.StatusInternalServerError, "failed to update service")
		return
	}
	util.JSON(w, http.StatusOK, map[string]string{"message": "service updated"})
}

func (a *API) AdminDeleteService(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.Error(w, http.StatusBadRequest, "invalid service id")
		return
	}
	if err := a.Services.Delete(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.Error(w, http.StatusNotFound, "service not found")
			return
		}
		util.Error(w, http.StatusInternalServerError, "failed to delete service")
		return
	}
	util.JSON(w, http.StatusOK, map[string]string{"message": "service deleted"})
}
