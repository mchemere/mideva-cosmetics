package models

import "time"

type Administrator struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Service struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Category      string    `json:"category"`
	Description   string    `json:"description"`
	PriceLabel    string    `json:"price_label"`
	DurationLabel string    `json:"duration_label"`
	ImagePath     string    `json:"image_path"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Booking struct {
	ID            int       `json:"id"`
	CustomerName  string    `json:"customer_name"`
	PhoneNumber   string    `json:"phone_number"`
	Email         *string   `json:"email,omitempty"`
	ServiceID     *int      `json:"service_id,omitempty"`
	ServiceName   string    `json:"service_name"`
	PreferredDate string    `json:"preferred_date"`
	PreferredTime string    `json:"preferred_time"`
	Message       *string   `json:"message,omitempty"`
	Status        string    `json:"status"`
	AdminNotes    *string   `json:"admin_notes,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Inquiry struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	PhoneNumber *string   `json:"phone_number,omitempty"`
	Email       *string   `json:"email,omitempty"`
	Subject     *string   `json:"subject,omitempty"`
	Message     string    `json:"message"`
	CreatedAt   time.Time `json:"created_at"`
}
