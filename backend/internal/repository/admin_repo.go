package repository

import (
	"context"
	"database/sql"

	"github.com/mchemere/gifted-hands/backend/internal/models"
)

type AdminRepository struct{ DB *sql.DB }

func (r *AdminRepository) GetByUsername(ctx context.Context, username string) (*models.Administrator, error) {
	row := r.DB.QueryRowContext(ctx, `SELECT id, username, password_hash, COALESCE(full_name,''), created_at, updated_at FROM administrators WHERE username=$1`, username)
	var a models.Administrator
	if err := row.Scan(&a.ID, &a.Username, &a.PasswordHash, &a.FullName, &a.CreatedAt, &a.UpdatedAt); err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *AdminRepository) Create(ctx context.Context, username, hash, fullName string) error {
	_, err := r.DB.ExecContext(ctx, `INSERT INTO administrators (username, password_hash, full_name) VALUES ($1,$2,$3)`, username, hash, fullName)
	return err
}
