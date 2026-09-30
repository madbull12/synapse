package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvitationStatus string

type Workspace struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string         `gorm:"not null;size:100" json:"name"`
	Slug      string         `gorm:"not null;size:100;uniqueIndex" json:"slug"`
	LogoURL   string         `gorm:"size:255" json:"logo_url"`
	OwnerID   uuid.UUID      `gorm:"type:uuid;not null;index" json:"owner_id"`
	Users     []User         `gorm:"many2many:workspace_members;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"users"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type WorkspaceMember struct {
	WorkspaceID uuid.UUID `gorm:"type:uuid;primaryKey" json:"workspace_id"`
	UserID      uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	Role        string    `gorm:"type:varchar(20);default:'member'" json:"role"` // admin, member, owner
	JoinedAt    time.Time `json:"joined_at"`
}

const (
	InvitePending  InvitationStatus = "PENDING"
	InviteAccepted InvitationStatus = "ACCEPTED"
	InviteRejected InvitationStatus = "REJECTED"
)

type WorkspaceInvitation struct {
	ID          uuid.UUID        `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	WorkspaceID uuid.UUID        `json:"workspace_id" gorm:"type:uuid;not null;index"`
	Workspace   Workspace        `json:"workspace,omitempty" gorm:"foreignKey:WorkspaceID;constraint:OnDelete:CASCADE"`
	Email       string           `json:"email" gorm:"not null;index"`
	Role        string           `json:"role" gorm:"not null;default:'member'"`
	InvitedByID uuid.UUID        `json:"invited_by_id" gorm:"type:uuid;not null"`
	Status      InvitationStatus `json:"status" gorm:"type:varchar(20);not null;default:'PENDING'"`
	ExpiresAt   time.Time        `json:"expires_at" gorm:"not null"`
	CreatedAt   time.Time        `json:"created_at"`
}
