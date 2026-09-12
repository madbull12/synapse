package apputil

import (
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