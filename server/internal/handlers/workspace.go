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
	var req dto.CreateWorkspaceRequest
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

func (h *WorkspaceHandler) HandleAddMember(c *gin.Context) {
	workspaceID, err := uuid.Parse(c.Param("workspaceId"))
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_ID", "Invalid workspace ID format"))
		return
	}

	var req dto.AddWorkspaceMemberRequest
	if !apputil.BindAndValidate(c, &req) {
		return
	}

	err = h.srv.AddMemberToWorkspace(c.Request.Context(), workspaceID, &req)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, 200, "Member added to workspace successfully", nil)
}

func (h *WorkspaceHandler) HandleSendInvitation(c *gin.Context) {
	workspaceID, err := uuid.Parse(c.Param("workspaceId"))
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_ID", "Invalid workspace ID format"))
		return
	}

	inviterID, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	var req dto.SendInvitationRequest
	if !apputil.BindAndValidate(c, &req) {
		return
	}

	invite, err := h.srv.SendInvitation(c.Request.Context(), workspaceID, inviterID, &req)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, 201, "Invitation sent successfully", invite)
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

func (h *WorkspaceHandler) HandleVerifyInvitation(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		dto.RespondError(c, apperr.BadRequest("MISSING_TOKEN", "Missing invitation token"))
		return
	}

	details, err := h.srv.VerifyInvitation(c.Request.Context(), token)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, 200, "Invitation verified successfully", details)
}

func (h *WorkspaceHandler) HandleAcceptInvitation(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		dto.RespondError(c, apperr.BadRequest("INVALID_TOKEN", "Invitation token is required"))
		return
	}

	userID, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	err = h.srv.AcceptInvitationByToken(c.Request.Context(), token, userID)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, 200, "Invitation accepted successfully", nil)
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
