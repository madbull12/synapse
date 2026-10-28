package service

import (
	"context"
	"server/internal/models"
	"time"

	"github.com/google/uuid"
)

type PaginatedMessages struct {
	Messages []models.Message `json:"messages"`
	NextCursor *time.Time       `json:"next_cursor"`
	HasMore    bool             `json:"has_more"`
}

type MessageService interface {
	SendMessage(ctx context.Context, channelID, userID uuid.UUID, content string) (*models.Message, error)
	GetChannelMessages(ctx context.Context, channelID uuid.UUID, before *time.Time, limit int) (*PaginatedMessages, error)
}