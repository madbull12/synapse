package repository

import (
	"context"
	"server/internal/models"

	"gorm.io/gorm"
)

type ChannelRepository interface {
	CreateChannel(ctx context.Context, db *gorm.DB, channel *models.Channel) error
}

type channelRepository struct {
	db *gorm.DB
}

func NewChannelRepository(db *gorm.DB) ChannelRepository {
	return &channelRepository{db: db}
}

func (r *channelRepository) CreateChannel(ctx context.Context, db *gorm.DB, channel *models.Channel) error {
    return db.WithContext(ctx).Create(channel).Error
}