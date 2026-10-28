package service

import (
	"context"
	"server/internal/apperr"
	"server/internal/models"
	"server/internal/repository"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
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

type messageService struct {
	db          *gorm.DB
	messageRepo repository.MessageRepository
	channelRepo repository.ChannelRepository
}

func NewMessageService(db *gorm.DB,messageRepo repository.MessageRepository,channelRepo repository.ChannelRepository) MessageService {
	return &messageService{
			db:          db,
			messageRepo: messageRepo,
			channelRepo: channelRepo,
		}
}

func (s *messageService) SendMessage(ctx context.Context, channelID, userID uuid.UUID, content string) (*models.Message, error) {
	if strings.TrimSpace(content) == "" {
        return nil, apperr.BadRequest("EMPTY_MESSAGE", "Message content cannot be empty")
    }

	isMember, err := s.channelRepo.IsUserInChannel(ctx, channelID, userID)
    if err != nil {
       return nil, apperr.Internal(err)
    }
    if !isMember {
        return nil, apperr.Forbidden("UNAUTHORIZED_CHANNEL_ACCESS", "You are not a member of this channel")
    }
	
	message := &models.Message{
		ID: uuid.New(),
		ChannelID: &channelID,
		UserID:    userID,
		Content:   content,
	}

	if err := s.messageRepo.Create(ctx, s.db, message); err != nil {
		return nil, err
	}

	return message, nil
}
