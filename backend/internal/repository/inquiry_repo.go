package repository

import (
	"context"
	"database/sql"

	"github.com/mchemere/gifted-hands/backend/internal/models"
)

type InquiryRepository struct{ DB *sql.DB }

func (r *InquiryRepository) Create(ctx context.Context, in *models.Inquiry) error {
	return r.DB.QueryRowContext(ctx, `INSERT INTO inquiries (name,phone_number,email,subject,message) VALUES ($1,$2,$3,$4,$5) RETURNING id,created_at`,
		in.Name, in.PhoneNumber, in.Email, in.Subject, in.Message).Scan(&in.ID, &in.CreatedAt)
}

func (r *InquiryRepository) List(ctx context.Context) ([]models.Inquiry, error) {
	rows, err := r.DB.QueryContext(ctx, `SELECT id,name,phone_number,email,subject,message,created_at FROM inquiries ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Inquiry
	for rows.Next() {
		var in models.Inquiry
		if err := rows.Scan(&in.ID, &in.Name, &in.PhoneNumber, &in.Email, &in.Subject, &in.Message, &in.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, in)
	}
	return out, rows.Err()
}
