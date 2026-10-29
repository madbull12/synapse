package service

import (
	"context"
	"server/internal/apperr"
	"server/internal/dto"
	"server/internal/models"
	"server/internal/repository"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MessageService interface {
	SendMessage(ctx context.Context, channelID, userID uuid.UUID, content string) (*models.Message, error)
	GetChannelMessages(ctx context.Context, channelID, UserID uuid.UUID, before *time.Time, limit int) (*dto.PaginatedMessages, error)
}

type messageService struct {
	db          *gorm.DB
	messageRepo repository.MessageRepository
	channelRepo repository.ChannelRepository
}

func NewMessageService(db *gorm.DB, messageRepo repository.MessageRepository, channelRepo repository.ChannelRepository) MessageService {
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
		ID:        uuid.New(),
		ChannelID: &channelID,
		UserID:    userID,
		Content:   content,
	}

	if err := s.messageRepo.Create(ctx, s.db, message); err != nil {
		return nil, err
	}

	return message, nil
}

func (s *messageService) GetChannelMessages(ctx context.Context, channelID, userID uuid.UUID, before *time.Time, limit int) (*dto.PaginatedMessages, error) {
	isMember, err := s.channelRepo.IsUserInChannel(ctx, channelID, userID)
	if err != nil {
		return nil, apperr.Internal(err)
	}
	if !isMember {
		return nil, apperr.Forbidden("UNAUTHORIZED_CHANNEL_ACCESS", "You do not have access to view messages in this channel")
	}

	if limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}
	fetchLimit := limit + 1
	messages, err := s.messageRepo.GetByChannelID(ctx, s.db, channelID, before, fetchLimit)
	if err != nil {
		return nil, err
	}

	hasMore := false
	if len(messages) > limit {
		hasMore = true
		messages = messages[:limit]
	}

	reverseMessages(messages)

	var nextCursor *time.Time
	if len(messages) > 0 {
		nextCursor = &messages[0].CreatedAt
	}

	return &dto.PaginatedMessages{
		Messages:   messages,
		NextCursor: nextCursor,
		HasMore:    hasMore,
	}, nil
}

func reverseMessages(messages []models.Message) {
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}
}
