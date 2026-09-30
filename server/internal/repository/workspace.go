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
	GetByIdAndUser(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (*models.Workspace, error)
	AddMember(ctx context.Context, db *gorm.DB, workspace *models.WorkspaceMember) error
	CreateInvitation(ctx context.Context, db *gorm.DB, invite *models.WorkspaceInvitation) error
	FindInvitationByID(ctx context.Context, db *gorm.DB, id uuid.UUID) (*models.WorkspaceInvitation, error)
	UpdateInvitationStatus(ctx context.Context, db *gorm.DB, id uuid.UUID, status models.InvitationStatus) error
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

func (r *workspaceRepository) CreateInvitation(ctx context.Context, db *gorm.DB, invite *models.WorkspaceInvitation) error {
	return db.WithContext(ctx).Create(invite).Error
}

func (r *workspaceRepository) FindInvitationByID(ctx context.Context, db *gorm.DB, id uuid.UUID) (*models.WorkspaceInvitation, error) {
	var invite models.WorkspaceInvitation
	err := db.WithContext(ctx).Preload("Workspace").First(&invite, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *workspaceRepository) UpdateInvitationStatus(ctx context.Context, db *gorm.DB, id uuid.UUID, status models.InvitationStatus) error {
	return db.WithContext(ctx).Model(&models.WorkspaceInvitation{}).Where("id = ?", id).Update("status", status).Error
}

func (r *workspaceRepository) AddMember(ctx context.Context, db *gorm.DB, member *models.WorkspaceMember) error {
	return db.WithContext(ctx).Create(member).Error
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

func (r *workspaceRepository) GetByIdAndUser(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (*models.Workspace, error) {
	var workspace models.Workspace

	err := r.db.WithContext(ctx).
		Preload("Users").
		Joins("JOIN workspace_members ON workspace_members.workspace_id = workspaces.id").
		Where("workspaces.id = ? AND workspace_members.user_id = ?", workspaceId, userId).
		First(&workspace).Error

	if err != nil {
		return nil, err // Returns gorm.ErrRecordNotFound if they aren't a member or workspace doesn't exist
	}

	return &workspace, nil
}
