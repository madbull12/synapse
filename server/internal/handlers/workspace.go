package handlers

import (
	"server/internal/apperr"
	"server/internal/dto"
	"server/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WorkspaceHandler struct {
	srv service.WorkspaceService
}

func NewWorkspaceHandler(srv service.WorkspaceService) *WorkspaceHandler {
	return &WorkspaceHandler{srv: srv}
}

func (h *WorkspaceHandler) HandleCreateWorkspace(c *gin.Context) {
 userIdValue, exists := c.Get("userID")
 if !exists {
	dto.RespondError(c, apperr.Unauthorized("USER_ID_NOT_FOUND", "User ID not found in context"))
	return
 }

 userId, ok := userIdValue.(uuid.UUID)
 if !ok {
	dto.RespondError(c, apperr.BadRequest("INVALID_USER_ID", "Invalid user ID format"))
	return
 }

 var req service.CreateWorkspaceRequest
if err := c.ShouldBindJSON(&req); err != nil {
    // Map the raw validator errors to your apperr structure using your dto package
    fieldErrors := dto.MapValidationErrors(err)
    
    // Return a structured 422 Unprocessable Entity error
	appErrors := make([]apperr.FieldError, len(fieldErrors))
	for i, fieldError := range fieldErrors {
		appErrors[i] = apperr.FieldError{
			Field:   fieldError.Field,
			Message: fieldError.Message,
		}
	}
	dto.RespondError(c, apperr.ValidationError(appErrors))
    return
}
}