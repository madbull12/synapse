package repository

import (
	"context"
	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChannelRepository interface {
	CreateChannel(ctx context.Context, db *gorm.DB, channel *models.Channel) error
	AddChannelMember(ctx context.Context, db *gorm.DB, member *models.ChannelMember) error
	IsUserInChannel(ctx context.Context, channelId uuid.UUID, userId uuid.UUID) (bool, error)
	GetWorkspaceChannels(ctx context.Context, workspaceId uuid.UUID) ([]*models.Channel, error)
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

func (r *channelRepository) AddChannelMember(ctx context.Context, db *gorm.DB, member *models.ChannelMember) error {
	return db.WithContext(ctx).Create(member).Error
}

func (r *channelRepository) IsUserInChannel(ctx context.Context, channelId uuid.UUID, userId uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Table("channel_members").
		Where("channel_id = ? AND user_id = ?", channelId, userId).
		Count(&count).Error

	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *channelRepository) GetWorkspaceChannels(ctx context.Context, workspaceId uuid.UUID) ([]*models.Channel, error) {
	var channels []*models.Channel
	err := r.db.WithContext(ctx).Preload("Members").Where("workspace_id = ?", workspaceId).Find(&channels).Error
	if err != nil {
		return nil, err
	}
	return channels, nil
}
