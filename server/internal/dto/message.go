package dto

import (
	"server/internal/models"
	"time"
)

type PaginatedMessages struct {
	Messages   []models.Message `json:"messages"`
	NextCursor *time.Time       `json:"next_cursor"`
	HasMore    bool             `json:"has_more"`
}

type SendMessageRequest struct {
	Content string `json:"content" binding:"required"`
}
