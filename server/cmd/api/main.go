package main

import (
	"log"
	"os"

	"server/internal/app"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found. Relying on system environment variables.")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("CRITICAL CONFIG ERROR: DATABASE_URL is not set in your environment variables.")
	}

	app.Run(&app.Config{
		DatabaseURL: dbURL,
		Port:        port,
	})
}