package repository

import (
	"context"
	"server/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MessageRepository interface {
	Create(ctx context.Context, db *gorm.DB, message *models.Message) (*models.Message, error)
	GetByChannelID(ctx context.Context, db *gorm.DB, channelID uuid.UUID, before *time.Time, limit int) ([]models.Message, error)
}