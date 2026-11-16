package repository

import (
	"context"
	"database/sql"

	"github.com/mchemere/gifted-hands/backend/internal/models"
)

type BookingRepository struct{ DB *sql.DB }

func (r *BookingRepository) Create(ctx context.Context, b *models.Booking) error {
	return r.DB.QueryRowContext(ctx, `INSERT INTO bookings (customer_name,phone_number,email,service_id,service_name,preferred_date,preferred_time,message,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING id,status,created_at,updated_at`,
		b.CustomerName, b.PhoneNumber, b.Email, b.ServiceID, b.ServiceName, b.PreferredDate, b.PreferredTime, b.Message).Scan(&b.ID, &b.Status, &b.CreatedAt, &b.UpdatedAt)
}

func (r *BookingRepository) List(ctx context.Context) ([]models.Booking, error) {
	rows, err := r.DB.QueryContext(ctx, `SELECT id,customer_name,phone_number,email,service_id,service_name,to_char(preferred_date,'YYYY-MM-DD'),preferred_time,message,status,admin_notes,created_at,updated_at FROM bookings ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Booking
	for rows.Next() {
		var b models.Booking
		if err := rows.Scan(&b.ID, &b.CustomerName, &b.PhoneNumber, &b.Email, &b.ServiceID, &b.ServiceName, &b.PreferredDate, &b.PreferredTime, &b.Message, &b.Status, &b.AdminNotes, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

func (r *BookingRepository) UpdateStatus(ctx context.Context, id int, status string, notes *string) error {
	res, err := r.DB.ExecContext(ctx, `UPDATE bookings SET status=$1, admin_notes=$2 WHERE id=$3`, status, notes, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *BookingRepository) Delete(ctx context.Context, id int) error {
	res, err := r.DB.ExecContext(ctx, `DELETE FROM bookings WHERE id=$1`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}
