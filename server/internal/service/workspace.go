package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"server/internal/apperr"
	"server/internal/models"
	"server/internal/repository"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/resend/resend-go/v4"
	"gorm.io/gorm"
)

type CreateWorkspaceRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=100"`
	Slug    string `json:"slug" binding:"required,min=2,max=100"`
	LogoURL string `json:"logo_url"`
}

type AddWorkspaceMemberRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role"` // e.g., "member", "admin"
}

type SendInvitationRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"omitempty,oneof=member admin"`
}

type WorkspaceService interface {
	CreateWorkspace(ctx context.Context, userID uuid.UUID, req *CreateWorkspaceRequest) (*models.Workspace, error)
	GetWorkspacesForUser(ctx context.Context, userID uuid.UUID) ([]*models.Workspace, error)
	GetWorkspaceForUser(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (*models.Workspace, error)
	AddMemberToWorkspace(ctx context.Context, workspace uuid.UUID, req *AddWorkspaceMemberRequest) error
	SendInvitation(ctx context.Context, workspaceID uuid.UUID, inviterID uuid.UUID, req *SendInvitationRequest) (*models.WorkspaceInvitation, error) 
	AcceptInvitationByToken(ctx context.Context, token string, userID uuid.UUID) error
}

type workspaceService struct {
    db                        *gorm.DB
    workspaceRepository       repository.WorkspaceRepository
    channelRepository         repository.ChannelRepository
    authRepository            repository.AuthRepository
    workspaceMemberRepository repository.WorkspaceMemberRepository
}

func NewWorkspaceService(
    db *gorm.DB,
    workspaceRepository repository.WorkspaceRepository,
    channelRepository repository.ChannelRepository,
    authRepository repository.AuthRepository,
    workspaceMemberRepository repository.WorkspaceMemberRepository,
) WorkspaceService {
    return &workspaceService{
        db:                        db,
        workspaceRepository:       workspaceRepository,
        channelRepository:         channelRepository,
        authRepository:            authRepository,
        workspaceMemberRepository: workspaceMemberRepository,
    }
}


func generateSecureToken() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		panic(fmt.Sprintf("failed to generate secure token: %v", err))
	}

	return base64.RawURLEncoding.EncodeToString(b)
}

func SendWorkspaceInviteEmail(toEmail, workspaceName, inviteToken string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY environment variable is not set")
	}

	client := resend.NewClient(apiKey)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	inviteURL := fmt.Sprintf("%s/register?token=%s", frontendURL, inviteToken)

	htmlContent := fmt.Sprintf(
		`<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #111827;">
			<div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
				<h2 style="margin-top: 0; color: #1f2937;">Workspace Invitation</h2>
				<p>You have been invited to join the <strong>%s</strong> workspace on Synapse.</p>
				<p style="margin: 25px 0;">
					<a href="%s" style="background-color: #000000; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
				</p>
				<p style="font-size: 13px; color: #6b7280;">If you weren't expecting this invite, you can safely ignore this email.</p>
			</div>
		</div>`,
		workspaceName,
		inviteURL,
	)

	params := &resend.SendEmailRequest{
		From:    "Synapse <noreply@mail.andrianlysander.com>",
		To:      []string{toEmail},
		Subject: fmt.Sprintf("You've been invited to join %s on Synapse", workspaceName),
		Html:    htmlContent,
		ReplyTo: "noreply@mail.andrianlysander.com",
	}

	ctx := context.Background()
	_, err := client.Emails.SendWithContext(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to send email via resend SDK: %v", err)
	}

	return nil
}

func (s *workspaceService) CreateWorkspace(ctx context.Context, userID uuid.UUID, req *CreateWorkspaceRequest) (*models.Workspace, error) {
	slug := strings.ToLower(strings.TrimSpace(req.Slug))
	slug = strings.ReplaceAll(slug, " ", "-")

	workspace := &models.Workspace{
		ID:      uuid.New(),
		Name:    strings.TrimSpace(req.Name),
		Slug:    slug,
		LogoURL: req.LogoURL,
		OwnerID: userID,
	}

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := s.workspaceRepository.Create(ctx, tx, workspace); err != nil {
			return err
		}

		// Add the owner as a member of the workspace
		member := &models.WorkspaceMember{
			WorkspaceID: workspace.ID,
			UserID:      userID,
			Role:        "owner",
			JoinedAt:    time.Now(),
		}

		if err := s.workspaceRepository.AddMember(ctx, tx, member); err != nil {
			return err
		}
		generalChannel := &models.Channel{
			ID:          uuid.New(),
			Name:        "general",
			Topic:       "General discussion for the workspace",
			Type:        "PUBLIC",
			WorkspaceID: workspace.ID,
			CreatorID:   userID,
		}
		if err := s.channelRepository.CreateChannel(ctx, tx, generalChannel); err != nil {
			return err
		}

		channelMember := &models.ChannelMember{
			ChannelID: generalChannel.ID,
			UserID:    userID,
			JoinedAt:  time.Now(),
		}

		if err := s.channelRepository.AddChannelMember(ctx, tx, channelMember); err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return nil, apperr.Internal(err)
	}

	return workspace, nil

}
func (s *workspaceService) AddMemberToWorkspace(ctx context.Context, workspaceID uuid.UUID, req *AddWorkspaceMemberRequest) error {
	user, err := s.authRepository.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}

	role := strings.TrimSpace(req.Role)
	if role == "" {
		role = "member"
	}

	member := &models.WorkspaceMember{
		WorkspaceID: workspaceID,
		UserID:      user.ID,
		Role:        role,
		JoinedAt:    time.Now(),
	}

	if err := s.workspaceRepository.AddMember(ctx, s.db, member); err != nil {
		return err
	}

	return nil
}


func (s *workspaceService) SendInvitation(ctx context.Context, workspaceID uuid.UUID, inviterID uuid.UUID, req *SendInvitationRequest) (*models.WorkspaceInvitation, error) {
    email := strings.ToLower(strings.TrimSpace(req.Email))
    role := strings.TrimSpace(req.Role)
    if role == "" {
        role = "member"
    }

    var invite *models.WorkspaceInvitation
    
    err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        existingUser, err := s.authRepository.FindByEmail(ctx, email)
        
        if err == nil && existingUser != nil {
            // SCENARIO A: User already exists! Check if they are already a member first.
			isMember, err := s.workspaceMemberRepository.IsUserInWorkspace(ctx, workspaceID, existingUser.ID)
            if err != nil {
                return apperr.Internal(err, "failed to check existing workspace membership")
            }

            if !isMember {
                // Directly add them as a workspace member if not already joined
                membership := &models.WorkspaceMember{
                    WorkspaceID: workspaceID,
                    UserID:      existingUser.ID,
                    Role:        role,
                    JoinedAt:    time.Now(),
                }
                
                if err := s.workspaceRepository.AddMember(ctx, tx, membership); err != nil {
                    return apperr.Internal(err, "Failed to add existing user to workspace")
                }
            }
            
            // Return nil for invitation because no pending invite record was created
            invite = nil
            return nil
        }

        // SCENARIO B: User does NOT exist yet. Proceed with the pending invitation token flow.
        invite = &models.WorkspaceInvitation{
            ID:          uuid.New(),
            WorkspaceID: workspaceID,
            Email:       email,
            Role:        role,
            InvitedByID: inviterID,
            Token:       generateSecureToken(),
            Status:      models.InvitePending,
            ExpiresAt:   time.Now().Add(7 * 24 * time.Hour),
        }

        if err := s.workspaceRepository.CreateInvitation(ctx, tx, invite); err != nil {
            return apperr.Internal(err, "failed to create workspace invitation")
        }

        return nil
    })

    if err != nil {
        return nil, err
    }

    // If Scenario B was triggered (invite is not nil), dispatch the email asynchronously
    if invite != nil {
        go func() {
            workspaceName, err := s.workspaceRepository.GetWorkspaceName(context.Background(), workspaceID)
            if err != nil {
                // Fallback or log error
                workspaceName = "Synapse Workspace"
            }
            _ = SendWorkspaceInviteEmail(invite.Email, workspaceName, invite.Token)
        }()
    }

    return invite, nil
}
func (s *workspaceService) AcceptInvitationByToken(ctx context.Context, token string, userID uuid.UUID) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		invite, err := s.workspaceRepository.FindInvitationByToken(ctx, tx, token)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return apperr.NotFound("INVITATION_NOT_FOUND", "The invitation token is invalid or does not exist.")
			}
			return apperr.Internal(err, "failed to query workspace invitation by token")
		}

		if invite.Status != models.InvitePending {
			return apperr.BadRequest("INVITATION_PROCESSED", "This invitation has already been processed.")
		}

		if time.Now().After(invite.ExpiresAt) {
			return apperr.BadRequest("INVITATION_EXPIRED", "This invitation has expired.")
		}

		user, err := s.authRepository.FindByID(ctx, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return apperr.NotFound("USER_NOT_FOUND", "User account not found.")
			}
			return apperr.Internal(err, "failed to query user for invitation acceptance")
		}

		if !strings.EqualFold(user.Email, invite.Email) {
			return apperr.Forbidden("UNAUTHORIZED_INVITATION_ACCESS", "This invitation was sent to a different email address.")
		}

		isMember, err := s.workspaceMemberRepository.IsUserInWorkspace(ctx,invite.WorkspaceID,userID)
		if err != nil {
			return apperr.Internal(err, "failed to check existing workspace membership")
		}

		if isMember {
			if err := s.workspaceRepository.UpdateInvitationStatus(ctx, tx, invite.ID, models.InviteAccepted); err != nil {
				return apperr.Internal(err, "failed to update invitation status")
			}
			return nil
		}

		member := &models.WorkspaceMember{
			WorkspaceID: invite.WorkspaceID,
			UserID:      userID,
			Role:        invite.Role,
			JoinedAt:    time.Now(),
		}
		if err := s.workspaceRepository.AddMember(ctx, tx, member); err != nil {
			return apperr.Internal(err, "failed to add member to workspace")
		}

		if err := s.workspaceRepository.UpdateInvitationStatus(ctx, tx, invite.ID, models.InviteAccepted); err != nil {
			return apperr.Internal(err, "failed to update invitation status")
		}

		return nil
	})
}

func (s *workspaceService) GetWorkspacesForUser(ctx context.Context, userID uuid.UUID) ([]*models.Workspace, error) {
	workspaces, err := s.workspaceRepository.GetByUserId(ctx, userID)
	if err != nil {
		return nil, apperr.Internal(err)
	}
	return workspaces, nil
}

func (s *workspaceService) GetWorkspaceForUser(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (*models.Workspace, error) {
	workspace, err := s.workspaceRepository.GetByIdAndUser(ctx, workspaceId, userId)
	if err != nil {
		return nil, apperr.Forbidden("UNAUTHORIZED_WORKSPACE_ACCESS", "You do not have access to this workspace")
	}
	return workspace, nil
}
