package repository

import (
	"context"
	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WorkspaceRepository interface {
	Create(ctx context.Context, db *gorm.DB, workspace *models.Workspace) error
	GetByUserId(ctx context.Context, userId uuid.UUID) ([]*models.Workspace, error)
}

type workspaceRepository struct {
	db *gorm.DB
}

func NewWorkspaceRepository(db *gorm.DB) WorkspaceRepository {
	return &workspaceRepository{db: db}
}

func (r *workspaceRepository) Create(ctx context.Context, db *gorm.DB, workspace *models.Workspace) error {
    return db.WithContext(ctx).Create(workspace).Error
}
func (r *workspaceRepository) GetByUserId(ctx context.Context, userId uuid.UUID) ([]*models.Workspace, error) {
	var workspaces []*models.Workspace
	err := r.db.WithContext(ctx).
		Preload("Users").
		Table("workspaces").
		Select("workspaces.*").
		Joins("JOIN workspace_members ON workspace_members.workspace_id = workspaces.id").
		Where("workspace_members.user_id = ?", userId).
		Find(&workspaces).Error
	if err != nil {
		return nil, err
	}
	return workspaces, nil
}