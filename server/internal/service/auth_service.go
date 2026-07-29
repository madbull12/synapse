package service

import (
	"context"
	"errors"
	"server/internal/models"
	"server/internal/repository"
	"server/internal/utils"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(ctx context.Context, name, email, password string) (string,string, error)
	Login(ctx context.Context, email, password string) (string, string, error)
	Logout(ctx context.Context, token string) error
}

type authService struct {
	repo repository.UserRepository
}

func NewAuthService(repo repository.UserRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) Register(ctx context.Context, name, email, password string) (string,string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", "", errors.New("failed to secure user credentials")
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return "", "", errors.New("an account with this email already exists")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return "", "", errors.New("failed to generate access token")
	}

	// Generate a refresh token
	refreshToken, err := utils.GenerateRefreshToken()
	if err != nil {
		return "", "", errors.New("failed to generate refresh token")
	}

	// Save the refresh token to the database
	refreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // Set expiration for 7 days
	}

	if err := s.repo.SaveRefreshToken(ctx, refreshTokenRecord); err != nil {
		return "", "", errors.New("failed to save refresh token")
	}

	return accessToken, refreshToken, nil


}

func (s *authService) Login(ctx context.Context, email, password string) (string, string, error) {
	// 1. Check if the user profile exists
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return "", "", errors.New("invalid email or password credentials")
	}

	// 2. Securely compare incoming plain text with database hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", "", errors.New("invalid email or password credentials")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return "", "", errors.New("Failed to generate access token")
	}

	refreshToken, err := utils.GenerateRefreshToken()
	if err != nil {
		return "", "", errors.New("Failed to generate refresh token")
	}

	// Save the refresh token to the database
	refreshTokenRecord := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	if err := s.repo.SaveRefreshToken(ctx, refreshTokenRecord); err != nil {
		return "","", errors.New("Failed to save refresh token")
	}

	// 3. Issue the authentic session payload
	return accessToken, refreshToken, nil
}

func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	
	if refreshToken == "" {
        // Nothing to revoke if the refresh token cookie was already missing
        return nil
    }

    // Revoke the session by deleting the refresh token record from DB
    if err := s.repo.DeleteRefreshToken(ctx, refreshToken); err != nil {
        return errors.New("failed to revoke active session")
    }

    return nil
}