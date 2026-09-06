package service

import (
	"context"
	"errors"
	"server/internal/apperr"
	"server/internal/dto"
	"server/internal/models"
	"server/internal/repository"
	"server/internal/utils"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(ctx context.Context, name, email, password string) (*dto.AuthResult, error)
	Login(ctx context.Context, email, password string) (*dto.AuthResult, error)
	Logout(ctx context.Context, token string) error
	RefreshToken(ctx context.Context, refreshToken string) (string, string, error)
}

type authService struct {
	repo repository.AuthRepository
}

func NewAuthService(repo repository.AuthRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) Register(ctx context.Context, name, email, password string) (*dto.AuthResult, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to secure user credentials")
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := s.repo.Create(ctx, user); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, apperr.Conflict("EMAIL_EXISTS", "An account with this email already exists.")
		}
		return nil, apperr.Internal(err)
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return nil, apperr.Internal(err)
	}

	// Generate a refresh token
	refreshToken, err := utils.GenerateRefreshToken()
	if err != nil {
		return nil, apperr.Internal(err)
	}

	// Save the refresh token to the database
	refreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // Set expiration for 7 days
	}

	if err := s.repo.SaveRefreshToken(ctx, refreshTokenRecord); err != nil {
		return nil, apperr.Internal(err)
	}

	return &dto.AuthResult{
		AccessToken:  accessToken,
		// RefreshToken: refreshToken,
		UserID:       user.ID.String(),
	}, nil


}

func (s *authService) Login(ctx context.Context, email, password string) (*dto.AuthResult, error) {
	// 1. Check if the user profile exists
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, apperr.Unauthorized("INVALID_CREDENTIALS", "Invalid email or password credentials")
	}

	// 2. Securely compare incoming plain text with database hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, apperr.Unauthorized("INVALID_CREDENTIALS", "Invalid email or password credentials")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return nil, apperr.Internal(err)
	}

	refreshToken, err := utils.GenerateRefreshToken()
	if err != nil {
		return nil, apperr.Internal(err)
	}

	// Save the refresh token to the database
	refreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	if err := s.repo.SaveRefreshToken(ctx, refreshTokenRecord); err != nil {
		return nil, apperr.Internal(err)
	}

	// 3. Issue the authentic session payload
	return &dto.AuthResult{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		UserID:       user.ID.String(),
	}, nil
}

func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	
	if refreshToken == "" {
        // Nothing to revoke if the refresh token cookie was already missing
        return nil
    }

    // Revoke the session by deleting the refresh token record from DB
    if err := s.repo.DeleteRefreshToken(ctx, refreshToken); err != nil {
        return apperr.Internal(err)
    }

    return nil
}

func (s *authService) RefreshToken(ctx context.Context, refreshToken string) (string,string,error) {
if refreshToken == "" {
		return "", "", apperr.BadRequest("REFRESH_TOKEN_REQUIRED", "Refresh token is required")
	}

	// 1. Fetch valid refresh token from database
	storedToken, err := s.repo.GetRefreshToken(ctx, refreshToken)
	if err != nil {
		return "", "", apperr.BadRequest("INVALID_REFRESH_TOKEN", "Invalid or expired refresh token")
	}

	// 2. Fetch associated user profile
	user, err := s.repo.FindByID(ctx, storedToken.UserID)
	if err != nil {
		return "", "", apperr.NotFound("USER_NOT_FOUND", "User account not found")
	}

	// 3. Token Rotation: Revoke the old refresh token
	_ = s.repo.DeleteRefreshToken(ctx, refreshToken)

	// 4. Generate fresh 15-minute Access Token
	newAccessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return "", "", apperr.Internal(err)
	}

	// 5. Generate fresh 7-day Refresh Token
	newRefreshTokenStr, err := utils.GenerateRefreshToken()
	if err != nil {
		return "", "", apperr.Internal(err)
	}

	// 6. Save new Refresh Token record to DB
	newRefreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     newRefreshTokenStr,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	if err := s.repo.SaveRefreshToken(ctx, newRefreshTokenRecord); err != nil {
		return "", "", apperr.Internal(err)
	}

	return newAccessToken, newRefreshTokenStr, nil
}