package repository

import (
	"context"
	"errors"
	"server/internal/apperr"
	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WorkspaceMemberRepository interface {
	GetMemberRole(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (string, error)
	IsUserInWorkspace(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (bool, error)
	RemoveMember(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) error
}

type workspaceMemberRepository struct {
	db *gorm.DB
}

func NewWorkspaceMemberRepository(db *gorm.DB) WorkspaceMemberRepository {
	return &workspaceMemberRepository{db: db}
}

func (r *workspaceMemberRepository) GetMemberRole(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (string, error) {
	var member models.WorkspaceMember
	err := r.db.WithContext(ctx).
		Where("workspace_id = ? AND user_id = ?", workspaceId, userId).
		First(&member).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", apperr.NotFound("MEMBER_NOT_FOUND", "Workspace member not found")
		}
		return "", err
	}
	return member.Role, nil
}

func (r *workspaceMemberRepository) IsUserInWorkspace(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Table("workspace_members").
		Where("workspace_id = ? AND user_id = ?", workspaceId, userId).
		Count(&count).Error

	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *workspaceMemberRepository) RemoveMember(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) error {
	result := r.db.WithContext(ctx).
		Where("workspace_id = ? AND user_id = ?", workspaceId, userId).
		Delete(&models.WorkspaceMember{})

	if result.Error != nil {
		return apperr.Internal(result.Error)
	}

	if result.RowsAffected == 0 {
		return apperr.NotFound("MEMBER_NOT_FOUND", "Workspace member not found")
	}

	return nil
}
