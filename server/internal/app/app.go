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
	authRepo := repository.NewAuthRepository(db)
	authSrv  := service.NewAuthService(authRepo)
	authHandler := handlers.NewAuthHandler(authSrv)

	userRepo := repository.NewUserRepository(db)
	userSrv := service.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userSrv)

	workspaceRepo := repository.NewWorkspaceRepository(db)
	workspaceSrv := service.NewWorkspaceService(db, workspaceRepo)
	workspaceHandler := handlers.NewWorkspaceHandler(workspaceSrv)

	// 3. Setup Router
	r := gin.Default()
	setupCORS(r)
	setupRoutes(r, authHandler, userHandler,workspaceHandler)

	// 4. Start Server
	log.Printf("Synapse API server running live on port %s 🚀", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func initDB(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn), // Limits logging overhead
		TranslateError: true, // 👈 Enable this
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
	if err := db.AutoMigrate(&models.User{},&models.RefreshToken{},&models.Workspace{},&models.WorkspaceMember{}); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	return db
}

func setupCORS(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		// Allow Next.js client running on port 3000 to interact with this API
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

func setupRoutes(r *gin.Engine, auth *handlers.AuthHandler, user *handlers.UserHandler, workspace *handlers.WorkspaceHandler) {
	// Root API v1 group
	v1 := r.Group("/api/v1")

	// Public Auth endpoints -> /api/v1/auth/*
	publicAuth := v1.Group("/auth")
	{
		publicAuth.POST("/register", auth.HandleRegister)
		publicAuth.POST("/login", auth.HandleLogin)
		publicAuth.POST("/refresh", auth.HandleRefresh)
		publicAuth.POST("/logout", auth.HandleLogout)

	}

	protectedUser := v1.Group("/user")
	protectedUser.Use(middleware.AuthRequired())
	{
		protectedUser.GET("/:id/profile", user.HandleGetUserProfile)
	}

	protectedWorkspace := v1.Group("/workspaces")
	protectedWorkspace.Use(middleware.AuthRequired())
	{
		protectedWorkspace.POST("", workspace.HandleCreateWorkspace)
		protectedWorkspace.GET("", workspace.HandleGetUserWorkspaces)
		protectedWorkspace.GET("/:id", workspace.GetWorkspaceById)
	}


}