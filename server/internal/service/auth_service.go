package service

import (
	"context"
	"errors"
	"server/internal/models"
	"server/internal/repository"
	"server/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(ctx context.Context, name, email, password string) (string, error)
	Login(ctx context.Context, email, password string) (string, error)
}

type authService struct {
	repo repository.UserRepository
}

func NewAuthService(repo repository.UserRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) Register(ctx context.Context, name, email, password string) (string, error) {
	// 1. Hash the incoming plain text password securely
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("failed to secure user credentials")
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
	}

	// 2. Persist user records to the data tier
	if err := s.repo.Create(ctx, user); err != nil {
		return "", errors.New("an account with this email already exists")
	}

	// 3. Auto-generate a valid JWT access token string on signup
	return utils.GenerateToken(user.ID, user.Email)
}

func (s *authService) Login(ctx context.Context, email, password string) (string, error) {
	// 1. Check if the user profile exists
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid email or password credentials")
	}

	// 2. Securely compare incoming plain text with database hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("invalid email or password credentials")
	}

	// 3. Issue the authentic session payload
	return utils.GenerateToken(user.ID, user.Email)
}