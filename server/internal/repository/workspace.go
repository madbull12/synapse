package repository

import (
	"context"
	"server/internal/models"

	"gorm.io/gorm"
)

type WorkspaceRepository interface {
	Create(ctx context.Context, workspace *models.Workspace) error
	GetByUserId(ctx context.Context, userId string) ([]*models.Workspace, error)
}

type workspaceRepository struct {
	db *gorm.DB
}

func NewWorkspaceRepository(db *gorm.DB) WorkspaceRepository {
	return &workspaceRepository{db: db}
}

func (r *workspaceRepository) Create(ctx context.Context, workspace *models.Workspace) error {
	err := r.db.WithContext(ctx).Create(workspace).Error
	if err != nil {
		return err
	}
	return nil
}

func (r *workspaceRepository) GetByUserId(ctx context.Context, userId string) ([]*models.Workspace, error) {
	var workspaces []*models.Workspace
	err := r.db.WithContext(ctx).Where("user_id = ?", userId).Find(&workspaces).Error
	if err != nil {
		return nil, err
	}
	return workspaces, nil
}