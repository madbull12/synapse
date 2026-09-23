package repository

import (
	"context"
	"server/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WorkspaceMemberRepository interface {
	GetMemberRole(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (string,error)
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
        return "", err
    }
    return member.Role, nil // e.g., "admin" or "member"
}