package main

import (
	"context"
	"flag"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/mchemere/gifted-hands/backend/internal/auth"
	"github.com/mchemere/gifted-hands/backend/internal/database"
	"github.com/mchemere/gifted-hands/backend/internal/repository"
)

func main() {
	_ = godotenv.Load()
	username := flag.String("username", os.Getenv("ADMIN_USERNAME"), "admin username")
	password := flag.String("password", os.Getenv("ADMIN_PASSWORD"), "admin password")
	fullName := flag.String("name", os.Getenv("ADMIN_FULL_NAME"), "admin full name")
	flag.Parse()
	if *username == "" || *password == "" {
		log.Fatal("username and password are required (flags or ADMIN_USERNAME/ADMIN_PASSWORD env vars)")
	}
	dbURL := os.Getenv("DATABASE_URL")
	db, err := database.Connect(dbURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer db.Close()
	hash, err := auth.HashPassword(*password)
	if err != nil {
		log.Fatalf("hash password: %v", err)
	}
	repo := &repository.AdminRepository{DB: db}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := repo.Create(ctx, *username, hash, *fullName); err != nil {
		log.Fatalf("create admin: %v", err)
	}
	log.Printf("Administrator '%s' created successfully", *username)
}
