package dto

import (
	"errors"
	"net/http"
	"server/internal/apperr"

	"github.com/gin-gonic/gin"
)

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type APIResponse struct {
	Success   bool         `json:"success"`
	Message   string       `json:"message"`
	ErrorCode string       `json:"error_code,omitempty"`
	Errors    []FieldError `json:"errors,omitempty"`
	Data      any          `json:"data,omitempty"`
}

func RespondSuccess(c *gin.Context, status int, message string, data any) {
	c.JSON(status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// RespondError inspects any error and maps apperr automatically
func RespondError(c *gin.Context, err error) {
	var appErr *apperr.AppError

	if errors.As(err, &appErr) {
		// Convert apperr.FieldError to dto.FieldError if fields exist
		var fieldErrors []FieldError
		for _, f := range appErr.Fields {
			fieldErrors = append(fieldErrors, FieldError{
				Field:   f.Field,
				Message: f.Message,
			})
		}

		c.JSON(appErr.StatusCode, APIResponse{
			Success:   false,
			Message:   appErr.Message,
			ErrorCode: appErr.Code,
			Errors:    fieldErrors,
		})
		return
	}

	// Fallback for unhandled 500 errors
	c.JSON(http.StatusInternalServerError, APIResponse{
		Success:   false,
		Message:   "An unexpected error occurred",
		ErrorCode: "INTERNAL_ERROR",
	})
}