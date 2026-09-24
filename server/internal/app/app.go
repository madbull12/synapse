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

func Run(cfg *Config) {
	db := initDB(cfg.DatabaseURL)

	authRepo := repository.NewAuthRepository(db)
	authSrv  := service.NewAuthService(authRepo)
	authHandler := handlers.NewAuthHandler(authSrv)

	userRepo := repository.NewUserRepository(db)
	userSrv := service.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userSrv)

	workspaceRepo := repository.NewWorkspaceRepository(db)
	workspaceSrv := service.NewWorkspaceService(db, workspaceRepo)
	workspaceHandler := handlers.NewWorkspaceHandler(workspaceSrv)

	workspaceMemberRepo := repository.NewWorkspaceMemberRepository(db)

	channelRepo := repository.NewChannelRepository(db)
	channelSrv := service.NewChannelService(db,channelRepo,workspaceMemberRepo)
	channelHandler := handlers.NewChannelHandler(channelSrv)

	r := gin.Default()
	setupCORS(r)
	setupRoutes(r, authHandler, userHandler,workspaceHandler,channelHandler)

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

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to retrieve generic SQL driver state: %v", err)
	}

	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetConnMaxIdleTime(1 * time.Minute)

	log.Println("Database connection pool configured successfully.")

	log.Println("Running database migrations...")
	if err := db.AutoMigrate(&models.User{},&models.RefreshToken{},&models.Workspace{},&models.WorkspaceMember{},&models.Channel{},&models.ChannelMember{}); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	return db
}

func setupCORS(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
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

func setupRoutes(r *gin.Engine, auth *handlers.AuthHandler, user *handlers.UserHandler, workspace *handlers.WorkspaceHandler,channel *handlers.ChannelHandler) {
	v1 := r.Group("/api/v1")

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