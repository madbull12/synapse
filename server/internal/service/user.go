package service

import (
	"context"
	"server/internal/dto"
	"server/internal/repository"
)

type UserService interface {
	GetUserProfile(ctx context.Context, id string) (*dto.UserProfileResponse, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{
		repo: repo,
	}
}

func (u *userService) GetUserProfile(ctx context.Context, id string) (*dto.UserProfileResponse, error) {
	user, err := u.repo.FindById(ctx, id)
	if err != nil {
		return nil, err
	}

	return &dto.UserProfileResponse{
		ID:        user.ID.String(),
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}, nil
}

