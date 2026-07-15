package repository

import (
	"context"
	"server/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByEmail(ctx context.Context, email string) (*models.User, error)
}

type userRepo struct {
	db *gorm.DB
}


func (u *userRepo) Create(ctx context.Context, user *models.User) error {
	 return u.db.WithContext(ctx).Create(user).Error
}


func (u *userRepo) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := u.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}
