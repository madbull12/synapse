package repository

import (
	"context"
	"server/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindByID(ctx context.Context,id uuid.UUID) (*models.User,error)
	SaveRefreshToken(ctx context.Context, token *models.RefreshToken) error
	DeleteRefreshToken(ctx context.Context, token string) error
	GetRefreshToken(ctx context.Context, token string) (*models.RefreshToken, error)
	DeleteRefreshTokensByUserID(ctx context.Context, userID uuid.UUID) error
}

type authRepository struct {
	db *gorm.DB
}
func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) Create(ctx context.Context, user *models.User) error {
	 return r.db.WithContext(ctx).Create(user).Error
}


func (r *authRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) SaveRefreshToken(ctx context.Context, token *models.RefreshToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}

func (r *authRepository) GetRefreshToken(ctx context.Context, tokenStr string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	err := r.db.WithContext(ctx).
		Where("token = ? AND expires_at > ?", tokenStr, time.Now()).
		First(&token).Error
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *authRepository) DeleteRefreshToken(ctx context.Context, tokenStr string) error {
	return r.db.WithContext(ctx).
		Where("token = ?", tokenStr).
		Delete(&models.RefreshToken{}).Error
}

func (r *authRepository) DeleteRefreshTokensByUserID(ctx context.Context, userID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Delete(&models.RefreshToken{}).Error
}