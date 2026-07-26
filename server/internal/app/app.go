package app

import (
	"log"
	"net/http"
	"time"

	"server/internal/handlers"
	"server/internal/middleware"
	"server/internal/models"
	"server/internal/repository"
	"server/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	DatabaseURL string
	Port        string
}

// Run bootstraps and starts the authentication server
func Run(cfg *Config) {
	// 1. Initialize optimized DB Pool
	db := initDB(cfg.DatabaseURL)

	// 2. Initialize Dependency Injection Graph (Auth only)
	userRepo := repository.NewUserRepository(db)
	authSrv  := service.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authSrv)

	// 3. Setup Router
	r := gin.Default()
	setupCORS(r)
	setupRoutes(r, authHandler)

	// 4. Start Server
	log.Printf("Synapse API server running live on port %s 🚀", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func initDB(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn), // Limits logging overhead
	})
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	// Get underlying sql.DB to tune connection pooling
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to retrieve generic SQL driver state: %v", err)
	}

	// High Performance Pooling Configurations
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetConnMaxIdleTime(1 * time.Minute)

	log.Println("Database connection pool configured successfully.")

	// Auto-migrate Users schema only
	log.Println("Running database migrations...")
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	return db
}

func setupCORS(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		// Allows your Next.js client running on port 3000 to interact with this API
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})
}

func setupRoutes(r *gin.Engine, auth *handlers.AuthHandler) {
	api := r.Group("/api/v1")
	{
		// Public Auth routes
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", auth.HandleRegister)
			authGroup.POST("/login", auth.HandleLogin)
			authGroup.POST("/logout", auth.HandleLogout)
		}

		// Protected User routes
		userGroup := api.Group("/users")
		userGroup.Use(middleware.AuthRequired())
		{
			userGroup.GET("/me", func(c *gin.Context) {
				userID, _ := c.Get("userID")
				email, _ := c.Get("userEmail")

				c.JSON(http.StatusOK, gin.H{
					"message": "Authenticated successfully",
					"user_id": userID,
					"email":   email,
				})
			})
		}
	}
}