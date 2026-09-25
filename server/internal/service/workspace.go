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

type CreateWorkspaceRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=100"`
	Slug    string `json:"slug" binding:"required,min=2,max=100"`
	LogoURL string `json:"logo_url"`
}

type WorkspaceService interface {
	CreateWorkspace(ctx context.Context, userID uuid.UUID, req *CreateWorkspaceRequest) (*models.Workspace, error)
	GetWorkspacesForUser(ctx context.Context, userID uuid.UUID) ([]*models.Workspace, error)
	GetWorkspaceForUser(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (*models.Workspace, error)
}

type workspaceService struct {
	db                  *gorm.DB
	workspaceRepository repository.WorkspaceRepository
	channelRepository   repository.ChannelRepository
}

func NewWorkspaceService(db *gorm.DB, workspaceRepository repository.WorkspaceRepository, channelRepository repository.ChannelRepository) WorkspaceService {
	return &workspaceService{
		db:                  db,
		workspaceRepository: workspaceRepository,
		channelRepository:   channelRepository,
	}
}
func (s *workspaceService) CreateWorkspace(ctx context.Context, userID uuid.UUID, req *CreateWorkspaceRequest) (*models.Workspace, error) {
	slug := strings.ToLower(strings.TrimSpace(req.Slug))
	slug = strings.ReplaceAll(slug, " ", "-")

	workspace := &models.Workspace{
		ID:      uuid.New(),
		Name:    strings.TrimSpace(req.Name),
		Slug:    slug,
		LogoURL: req.LogoURL,
		OwnerID: userID,
	}

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := s.workspaceRepository.Create(ctx, tx, workspace); err != nil {
			return err
		}

		// Add the owner as a member of the workspace
		member := &models.WorkspaceMember{
			WorkspaceID: workspace.ID,
			UserID:      userID,
			Role:        "owner",
			JoinedAt:    time.Now(),
		}

		if err := tx.WithContext(ctx).Create(member).Error; err != nil {
			return err
		}
		generalChannel := &models.Channel{
			ID:          uuid.New(),
			Name:        "general",
			Topic:       "General discussion for the workspace",
			Type:        "PUBLIC",
			WorkspaceID: workspace.ID,
			CreatorID:   userID,
		}
		if err := s.channelRepository.CreateChannel(ctx, tx, generalChannel); err != nil {
			return err
		}

		channelMember := &models.ChannelMember{
			ChannelID: generalChannel.ID,
			UserID:    userID,
			JoinedAt:  time.Now(),
		}

		if err := s.channelRepository.AddChannelMember(ctx, tx, channelMember); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, apperr.Internal(err)
	}

	return workspace, nil

}

func (s *workspaceService) GetWorkspacesForUser(ctx context.Context, userID uuid.UUID) ([]*models.Workspace, error) {
	workspaces, err := s.workspaceRepository.GetByUserId(ctx, userID)
	if err != nil {
		return nil, apperr.Internal(err)
	}
	return workspaces, nil
}

func (s *workspaceService) GetWorkspaceForUser(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (*models.Workspace, error) {
	workspace, err := s.workspaceRepository.GetByIdAndUser(ctx, workspaceId, userId)
	if err != nil {
		// If GORM returns record not found, treat it as a clean Forbidden or Not Found
		return nil, apperr.Forbidden("UNAUTHORIZED_WORKSPACE_ACCESS", "You do not have access to this workspace")
	}
	return workspace, nil
}
