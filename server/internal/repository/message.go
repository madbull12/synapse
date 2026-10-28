package repository

import (
	"context"
	"server/internal/apperr"
	"server/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MessageRepository interface {
	Create(ctx context.Context, db *gorm.DB, message *models.Message) error
	GetByChannelID(ctx context.Context, db *gorm.DB, channelID uuid.UUID, before *time.Time, limit int) ([]models.Message, error)
}

type messageRepository struct{}

func NewMessageRepository() MessageRepository {
    return &messageRepository{}
}

func (r *messageRepository) Create(ctx context.Context, db *gorm.DB, message *models.Message) error {
    if err := db.WithContext(ctx).Create(message).Error; err != nil {
        return apperr.Internal(err)
    }
    return nil
}

func (r *messageRepository) GetByChannelID(ctx context.Context, db *gorm.DB, channelID uuid.UUID, before *time.Time,limit int) ([]models.Message, error) {
	var messages []models.Message
	query := db.WithContext(ctx).Where("channel_id = ?", channelID).Find(&messages).Limit(limit)

	if before != nil {
        query = query.Where("created_at < ?", before)
    }

	if err := query.Find(&messages).Error; err != nil {
        return nil, apperr.Internal(err)
    }

	return messages, nil
	
}
