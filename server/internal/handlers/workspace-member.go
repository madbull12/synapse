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

type WorkspaceMemberHandler struct {
	srv service.WorkspaceMemberService
}

func NewWorkspaceMemberHandler(srv service.WorkspaceMemberService) *WorkspaceMemberHandler {
	return &WorkspaceMemberHandler{srv: srv}
}


func (h *WorkspaceMemberHandler) HandleRemoveMemberFromWorkspace(c *gin.Context) {

	workspaceID, err := uuid.Parse(c.Param("workspaceId"))
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_ID", "Invalid workspace ID format"))
		return
	}

	targetUserID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_USER_ID", "Invalid target user ID format"))
		return
	}

	actorID, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	err = h.srv.RemoveMemberFromWorkspace(c.Request.Context(), actorID, workspaceID, targetUserID)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, http.StatusOK, "Member removed from workspace successfully", nil)
}