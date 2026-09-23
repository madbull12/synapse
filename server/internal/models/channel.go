package models

import (
	"time"

	"github.com/google/uuid"
)

type ChannelType string

const (
	ChannelTypePublic  ChannelType = "PUBLIC"
	ChannelTypePrivate ChannelType = "PRIVATE"
)

type Channel struct {
	ID 	  		uuid.UUID 		 	 `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name  		string      		 `gorm:"type:varchar(100);not null;uniqueIndex:idx_workspace_channel_name" json:"name"`
	Topic 		string      		 `gorm:"type:text" json:"topic"`
	Type  		ChannelType 		 `gorm:"type:varchar(50);default:'PUBLIC';not null" json:"type"`
	WorkspaceID uuid.UUID 			 `gorm:"type:uuid;not null;uniqueIndex:idx_workspace_channel_name" json:"workspace_id"`
	Workspace   Workspace 			 `gorm:"constraint:OnDelete:CASCADE;" json:"workspace,omitempty"`
	CreatorID   uuid.UUID            `gorm:"type:uuid;not null" json:"creator_id"`
	Creator     User      			 `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE;" json:"creator,omitempty"`
	Members 	[]User 				 `gorm:"many2many:channel_members;" json:"members,omitempty"`	
	CreatedAt 	time.Time      		 `json:"created_at"`
	UpdatedAt 	time.Time      		 `json:"updated_at"`
	
}

type ChannelMember struct {
	ChannelID uuid.UUID `gorm:"type:uuid;primaryKey" json:"channel_id"`
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	JoinedAt  time.Time `gorm:"default:current_timestamp" json:"joined_at"`
}