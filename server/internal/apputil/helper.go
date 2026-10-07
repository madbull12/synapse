package apputil

import (
	"crypto/sha256"
	"encoding/hex"
	"server/internal/apperr"
	"server/internal/dto"

	"github.com/gin-gonic/gin"
)

func BindAndValidate(c *gin.Context, req interface{}) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		fieldErrors := dto.MapValidationErrors(err)
		
		appErrors := make([]apperr.FieldError, len(fieldErrors))
		for i, fieldError := range fieldErrors {
			appErrors[i] = apperr.FieldError{
				Field:   fieldError.Field,
				Message: fieldError.Message,
			}
		}
		
		dto.RespondError(c, apperr.ValidationError(appErrors))
		return false
	}
	return true
}

func HashToken(rawToken string) string {
	hash := sha256.Sum256([]byte(rawToken))
	return hex.EncodeToString(hash[:])
}