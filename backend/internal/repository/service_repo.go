package repository

import (
	"context"
	"database/sql"

	"github.com/mchemere/gifted-hands/backend/internal/models"
)

type ServiceRepository struct{ DB *sql.DB }

func (r *ServiceRepository) ListActive(ctx context.Context) ([]models.Service, error) {
	rows, err := r.DB.QueryContext(ctx, `SELECT id,name,slug,category,description,price_label,duration_label,image_path,is_active,created_at,updated_at FROM services WHERE is_active=true ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Service
	for rows.Next() {
		var s models.Service
		if err := rows.Scan(&s.ID, &s.Name, &s.Slug, &s.Category, &s.Description, &s.PriceLabel, &s.DurationLabel, &s.ImagePath, &s.IsActive, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (r *ServiceRepository) ListAll(ctx context.Context) ([]models.Service, error) {
	rows, err := r.DB.QueryContext(ctx, `SELECT id,name,slug,category,description,price_label,duration_label,image_path,is_active,created_at,updated_at FROM services ORDER BY id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Service
	for rows.Next() {
		var s models.Service
		if err := rows.Scan(&s.ID, &s.Name, &s.Slug, &s.Category, &s.Description, &s.PriceLabel, &s.DurationLabel, &s.ImagePath, &s.IsActive, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (r *ServiceRepository) Create(ctx context.Context, s *models.Service) error {
	return r.DB.QueryRowContext(ctx, `INSERT INTO services (name,slug,category,description,price_label,duration_label,image_path,is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,created_at,updated_at`,
		s.Name, s.Slug, s.Category, s.Description, s.PriceLabel, s.DurationLabel, s.ImagePath, s.IsActive).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
}

func (r *ServiceRepository) Update(ctx context.Context, s *models.Service) error {
	res, err := r.DB.ExecContext(ctx, `UPDATE services SET name=$1,slug=$2,category=$3,description=$4,price_label=$5,duration_label=$6,image_path=$7,is_active=$8 WHERE id=$9`,
		s.Name, s.Slug, s.Category, s.Description, s.PriceLabel, s.DurationLabel, s.ImagePath, s.IsActive, s.ID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *ServiceRepository) Delete(ctx context.Context, id int) error {
	res, err := r.DB.ExecContext(ctx, `DELETE FROM services WHERE id=$1`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}
