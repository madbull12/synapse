package handlers

import (
	"net/http"
	"server/internal/apperr"
	"server/internal/apputil"
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
	userID, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}
	var req service.CreateWorkspaceRequest
	if !apputil.BindAndValidate(c, &req) {
		return
	}

	workspace, err := h.srv.CreateWorkspace(c.Request.Context(), userID, &req)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, 201, "Workspace created successfully", workspace)
}

func (h *WorkspaceHandler) HandleGetUserWorkspaces(c *gin.Context) {
	userID, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	workspaces, err := h.srv.GetWorkspacesForUser(c.Request.Context(), userID)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, http.StatusOK, "Workspaces retrieved successfully", workspaces)
}

func (h *WorkspaceHandler) GetWorkspaceById(c *gin.Context) {

	userId, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	idParam := c.Param("id")
	workspaceId, err := uuid.Parse(idParam)
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_UUID", "Provided workspace ID is invalid"))
		return
	}

	workspace, err := h.srv.GetWorkspaceForUser(c.Request.Context(), workspaceId, userId)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, http.StatusOK, "Workspace retrieved successfully", workspace)
}
