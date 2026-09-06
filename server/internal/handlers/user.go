package handlers

import (
	"net/http"
	"server/internal/dto"
	"server/internal/service"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	srv service.UserService
}

func NewUserHandler(srv service.UserService) *UserHandler {
	return &UserHandler{srv: srv}
}

func (h *UserHandler) HandleGetUserProfile(c *gin.Context) {
	id := c.Param("id")
	userProfile, err := h.srv.GetUserProfile(c, id)
	if err != nil {
		// Handle error appropriately
		dto.RespondError(c,err)
	}
	dto.RespondSuccess(c, http.StatusOK, "User profile retrieved successfully", userProfile)
}