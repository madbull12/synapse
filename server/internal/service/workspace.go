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
CreateWorkspace(ctx context.Context, userID uuid.UUID, req *CreateWorkspaceRequest) (*models.Workspace, error)}

type workspaceService struct {
	db   *gorm.DB // Kept for transaction control
	repo repository.WorkspaceRepository
}

func NewWorkspaceService(db *gorm.DB, repo repository.WorkspaceRepository) WorkspaceService {
	return &workspaceService{
		db:   db,
		repo: repo,
	}
}
func (s *workspaceService) CreateWorkspace(ctx context.Context, userID uuid.UUID, req *CreateWorkspaceRequest) (*models.Workspace, error) {
	slug := strings.ToLower(strings.TrimSpace(req.Slug))
	slug = strings.ReplaceAll(slug, " ", "-")

	workspace := &models.Workspace{
		ID:	  uuid.New(),
		Name: strings.TrimSpace(req.Name),
		Slug:slug,
		LogoURL: req.LogoURL,
		OwnerID: userID,
	}

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(ctx, tx, workspace); err != nil {
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

		return nil
	})
	
	if err != nil {
		return nil, apperr.Internal(err)
	}

	return workspace, nil

}