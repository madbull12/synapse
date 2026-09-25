package service

import (
	"context"
	"errors"
	"server/internal/apperr"
	"server/internal/dto"
	"server/internal/models"
	"server/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChannelService interface {
	CreateChannel(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID, req dto.CreateChannelRequest) (*models.Channel, error)
	GetWorkspaceChannels(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) ([]*models.Channel, error)
}

type channelService struct {
	db                        *gorm.DB
	channelRepository         repository.ChannelRepository
	workspaceMemberRepository repository.WorkspaceMemberRepository
}

func NewChannelService(
	db *gorm.DB,
	channelRepo repository.ChannelRepository,
	workspaceMemberRepo repository.WorkspaceMemberRepository,
) ChannelService {
	return &channelService{
		db:                        db,
		channelRepository:         channelRepo,
		workspaceMemberRepository: workspaceMemberRepo,
	}
}

func (s *channelService) CreateChannel(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID, req dto.CreateChannelRequest) (*models.Channel, error) {
	role, err := s.workspaceMemberRepository.GetMemberRole(ctx, workspaceId, userId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.Forbidden("NOT_WORKSPACE_MEMBER", "You are not a member of this workspace")
		}
		return nil, apperr.Internal(err)
	}

	if role != "admin" {
		return nil, apperr.Forbidden("ADMIN_REQUIRED", "Only workspace administrators can create channels")
	}

	channel := &models.Channel{
		ID:          uuid.New(),
		Name:        req.Name,
		Topic:       req.Topic,
		Type:        models.ChannelType(req.Type),
		WorkspaceID: workspaceId,
		CreatorID:   userId,
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := s.channelRepository.CreateChannel(ctx, tx, channel); err != nil {
			return err
		}
		if channel.Type == models.ChannelTypePrivate {
			member := &models.ChannelMember{
				ChannelID: channel.ID,
				UserID:    userId,
			}
			if err := s.channelRepository.AddChannelMember(ctx, tx, member); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, apperr.Internal(err)
	}

	return channel, nil
}

func (s *channelService) GetWorkspaceChannels(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) ([]*models.Channel, error) {
	isMember, err := s.workspaceMemberRepository.IsUserInWorkspace(ctx, workspaceId, userId)
	if err != nil {
		return nil, apperr.Internal(err, "Failed to verify workspace membership")
	}
	if !isMember {
		return nil, apperr.Forbidden("NOT_WORKSPACE_MEMBER", "You are not a member of this workspace")
	}

	channels, err := s.channelRepository.GetWorkspaceChannels(ctx, workspaceId)
	if err != nil {
		return nil, apperr.Internal(err, "Failed to fetch channels")
	}

	return channels, nil
}
