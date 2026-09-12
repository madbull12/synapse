package apputil

import (
	"errors"
	"server/internal/apperr"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetUserID(c *gin.Context) (uuid.UUID, error) {
	userIdValue, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, apperr.Unauthorized("UNAUTHORIZED", "Authentication required")
	}

	userId, ok := userIdValue.(uuid.UUID)
	if !ok {
		return uuid.Nil, apperr.Internal(errors.New("invalid user ID type in context"))
	}

	return userId, nil
}