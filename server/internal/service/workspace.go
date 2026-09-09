package service

import (
	"context"
	"server/internal/models"
)

type CreateWorkspaceRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=100"`
	Slug    string `json:"slug" binding:"required,min=2,max=100"`
	LogoURL string `json:"logo_url"`
}

type WorkspaceService interface {
	CreateWorkspace(ctx context.Context, req CreateWorkspaceRequest) (*models.Workspace, error)
}