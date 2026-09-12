package handlers

import (
	"net/http"
	"server/internal/apputil"
	"server/internal/dto"
	"server/internal/service"

	"github.com/gin-gonic/gin"
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

	dto.RespondSuccess(c, 201,"Workspace created successfully", workspace)
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

    // 3. Return a standardized success response
    dto.RespondSuccess(c, http.StatusOK, "Workspaces retrieved successfully", workspaces)
}