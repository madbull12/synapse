package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Workspace struct {
	ID        uuid.UUID 	 `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name 	  string         `gorm:"not null;size:100" json:"name"`
	Slug  	  string    	 `gorm:"not null;size:100;uniqueIndex" json:"slug"`
	LogoURL   string    	 `gorm:"size:255" json:"logo_url"`
	OwnerID   uuid.UUID 	 `gorm:"type:uuid;not null;index" json:"owner_id"`
	Users 	  []User	 	 `gorm:"many2many:workspace_members;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"users"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type WorkspaceMember struct {
    WorkspaceID uuid.UUID `gorm:"type:uuid;primaryKey" json:"workspace_id"`
    UserID      uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
    Role        string    `gorm:"type:varchar(20);default:'member'" json:"role"` // admin, member
    JoinedAt    time.Time `json:"joined_at"`
}