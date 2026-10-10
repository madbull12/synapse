package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"server/internal/apperr"
	"server/internal/apputil"
	"server/internal/dto"
	"server/internal/models"
	"server/internal/repository"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/resend/resend-go/v4"
	"gorm.io/gorm"
)

type WorkspaceService interface {
	CreateWorkspace(ctx context.Context, userID uuid.UUID, req *dto.CreateWorkspaceRequest) (*models.Workspace, error)
	GetWorkspacesForUser(ctx context.Context, userID uuid.UUID) ([]*models.Workspace, error)
	GetWorkspaceForUser(ctx context.Context, workspaceId uuid.UUID, userId uuid.UUID) (*models.Workspace, error)
	AddMemberToWorkspace(ctx context.Context, workspace uuid.UUID, req *dto.AddWorkspaceMemberRequest) error
	SendInvitation(ctx context.Context, workspaceID uuid.UUID, inviterID uuid.UUID, req *dto.SendInvitationRequest) (*models.WorkspaceInvitation, error)
	AcceptInvitationByToken(ctx context.Context, token string, userID uuid.UUID) error
	VerifyInvitation(ctx context.Context, rawToken string) (*dto.InvitationDetails, error)
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

func generateSecureToken() (string, error) {
	b := make([]byte, 32)

	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate invitation token: %w", err)
	}

	return base64.RawURLEncoding.EncodeToString(b), nil
}

func SendWorkspaceInviteEmail(ctx context.Context, toEmail, workspaceName, inviteToken string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY environment variable is not set")
	}

	client := resend.NewClient(apiKey)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	inviteURL := fmt.Sprintf("%s/auth/accept-invite?token=%s", frontendURL, inviteToken)

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

	_, err := client.Emails.SendWithContext(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to send invite email via resend SDK: %w", err)
	}

	return nil
}

// SendWorkspaceAddedEmail notifies an existing user that they've been added to a new workspace.
func SendWorkspaceAddedEmail(ctx context.Context, toEmail, workspaceName string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY environment variable is not set")
	}

	client := resend.NewClient(apiKey)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	dashboardURL := fmt.Sprintf("%s/dashboard", frontendURL)

	htmlContent := fmt.Sprintf(
		`<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #111827;">
			<div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
				<h2 style="margin-top: 0; color: #1f2937;">New Workspace Added</h2>
				<p>You have been added to the <strong>%s</strong> workspace on Synapse.</p>
				<p style="margin: 25px 0;">
					<a href="%s" style="background-color: #000000; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
				</p>
				<p style="font-size: 13px; color: #6b7280;">If you weren't expecting this, you can safely ignore this email.</p>
			</div>
		</div>`,
		workspaceName,
		dashboardURL,
	)

	params := &resend.SendEmailRequest{
		From:    "Synapse <noreply@mail.andrianlysander.com>",
		To:      []string{toEmail},
		Subject: fmt.Sprintf("You've been added to %s on Synapse", workspaceName),
		Html:    htmlContent,
		ReplyTo: "noreply@mail.andrianlysander.com",
	}

	_, err := client.Emails.SendWithContext(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to send added notification email via resend SDK: %w", err)
	}

	return nil
}

func (s *workspaceService) VerifyInvitation(ctx context.Context, rawToken string) (*dto.InvitationDetails, error) {
	rawToken = strings.TrimSpace(rawToken)
	if rawToken == "" {
		return nil, apperr.BadRequest("INVALID_TOKEN", "Invitation token is required.")
	}

	tokenHash := apputil.HashToken(rawToken)

	invite, err := s.workspaceRepository.FindInvitationByToken(ctx, nil, tokenHash)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.BadRequest("INVALID_INVITATION", "This invitation link is invalid or does not exist.")
		}
		return nil, apperr.Internal(err, "failed to query invitation by token")
	}

	if time.Now().After(invite.ExpiresAt) {
		return nil, apperr.BadRequest("EXPIRED_INVITATION", "This invitation link has expired.")
	}

	if invite.Status != models.InvitePending {
		return nil, apperr.BadRequest("INVITATION_PROCESSED", "This invitation has already been used.")
	}

	workspaceName, err := s.workspaceRepository.GetWorkspaceName(ctx, invite.WorkspaceID)
	if err != nil {
		workspaceName = "Synapse Workspace"
	}

	existingUser, err := s.authRepository.FindByEmail(ctx, invite.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperr.Internal(err, "failed to check existing user account")
	}

	isExistingUser := (err == nil && existingUser != nil)

	return &dto.InvitationDetails{
		Email:          invite.Email,
		WorkspaceName:  workspaceName,
		IsExistingUser: isExistingUser,
		Role:           invite.Role,
	}, nil
}

func (s *workspaceService) CreateWorkspace(ctx context.Context, userID uuid.UUID, req *dto.CreateWorkspaceRequest) (*models.Workspace, error) {
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
func (s *workspaceService) AddMemberToWorkspace(ctx context.Context, workspaceID uuid.UUID, req *dto.AddWorkspaceMemberRequest) error {
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

func (s *workspaceService) SendInvitation(
	ctx context.Context,
	workspaceID uuid.UUID,
	inviterID uuid.UUID,
	req *dto.SendInvitationRequest,
) (*models.WorkspaceInvitation, error) {
	if req == nil {
		return nil, apperr.BadRequest(
			"INVALID_REQUEST",
			"Invitation request is required",
		)
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	role := strings.TrimSpace(req.Role)

	if email == "" {
		return nil, apperr.BadRequest(
			"INVALID_EMAIL",
			"Email is required",
		)
	}

	if role == "" {
		role = "member"
	}

	if role != "member" && role != "admin" {
		return nil, apperr.BadRequest(
			"INVALID_ROLE",
			"Invalid workspace role",
		)
	}

	rawToken, err := generateSecureToken()
	if err != nil {
		return nil, apperr.Internal(
			err,
			"failed to generate invitation token",
		)
	}

	tokenHash := apputil.HashToken(rawToken)

	invite := &models.WorkspaceInvitation{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		Email:       email,
		Role:        role,
		InvitedByID: inviterID,
		Token:       tokenHash,
		Status:      models.InvitePending,
		ExpiresAt:   time.Now().Add(7 * 24 * time.Hour),
	}

	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {

		_, lookupErr := s.authRepository.FindByEmail(ctx, email)

		if lookupErr != nil &&
			!errors.Is(lookupErr, gorm.ErrRecordNotFound) {
			return apperr.Internal(
				lookupErr,
				"failed to look up invitation recipient",
			)
		}

		if err := s.workspaceRepository.CreateInvitation(
			ctx, tx, invite,
		); err != nil {
			return apperr.Internal(
				err,
				"failed to create workspace invitation",
			)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	invitationID := invite.ID
	recipientEmail := invite.Email
	workspaceIDForEmail := invite.WorkspaceID
	tokenForEmail := rawToken

	go func() {
		bgCtx, cancel := context.WithTimeout(
			context.Background(),
			10*time.Second,
		)
		defer cancel()

		workspaceName, err := s.workspaceRepository.GetWorkspaceName(
			bgCtx, workspaceIDForEmail,
		)
		if err != nil {
			// Log the error using projects
			workspaceName = "Synapse Workspace"
		}

		if err := SendWorkspaceInviteEmail(
			bgCtx,
			recipientEmail,
			workspaceName,
			tokenForEmail,
		); err != nil {
			// Log invitationID and the error.
			// Never log the raw token.
			_ = invitationID
		}
	}()

	return invite, nil
}

func (s *workspaceService) AcceptInvitationByToken(ctx context.Context, token string, userID uuid.UUID) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		tokenHash := apputil.HashToken(token)
		invite, err := s.workspaceRepository.FindInvitationByToken(ctx, tx, tokenHash)
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

		isMember, err := s.workspaceMemberRepository.IsUserInWorkspace(ctx, invite.WorkspaceID, userID)
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
