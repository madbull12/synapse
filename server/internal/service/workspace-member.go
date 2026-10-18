package service

import (
	"context"
	"server/internal/apperr"
	"server/internal/repository"

	"github.com/google/uuid"
)

type WorkspaceMemberService interface {
	RemoveMemberFromWorkspace(ctx context.Context, actorID uuid.UUID, workspaceId uuid.UUID, userID uuid.UUID) error
}

type workspaceMemberService struct {
	workspaceMemberRepository repository.WorkspaceMemberRepository
}

func NewWorkspaceMemberService(repo repository.WorkspaceMemberRepository) WorkspaceMemberService {
	return &workspaceMemberService{
		workspaceMemberRepository: repo,
	}
}
func (s *workspaceMemberService) RemoveMemberFromWorkspace(ctx context.Context, actorID uuid.UUID, workspaceId uuid.UUID, userId uuid.UUID) error {
	if actorID == userId {
		return apperr.BadRequest("SELF_REMOVAL_NOT_ALLOWED", "cannot remove yourself using this action; use leave workspace instead")
	}

	actorRole, err := s.workspaceMemberRepository.GetMemberRole(ctx, workspaceId, actorID)
	if err != nil {
		return err
	}

	targetRole, err := s.workspaceMemberRepository.GetMemberRole(ctx, workspaceId, userId)
	if err != nil {
		return err
	}

	
	if actorRole == "member" {
		return apperr.Forbidden("UNAUTHORIZED", "members cannot remove other workspace members")
	}
	if actorRole == "admin" && (targetRole == "owner" || targetRole == "admin") {
		return apperr.Forbidden("UNAUTHORIZED", "admins cannot remove owners or other admins")
	}

	return s.workspaceMemberRepository.RemoveMember(ctx, workspaceId, userId)
}