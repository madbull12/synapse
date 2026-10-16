package service

import (
	"context"
	"server/internal/repository"

	"github.com/google/uuid"
)

type WorkspaceMemberService interface {
	RemoveMemberFromWorkspace(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) error
}

type workspaceMemberService struct {
	workspaceMemberRepository repository.WorkspaceMemberRepository
}

func NewWorkspaceMemberService(repo repository.WorkspaceMemberRepository) WorkspaceMemberService {
	return &workspaceMemberService{
		workspaceMemberRepository: repo,
	}
}
func (s *workspaceMemberService) RemoveMemberFromWorkspace(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) error {

	return s.workspaceMemberRepository.RemoveMember(ctx, workspaceId, userId)
}
