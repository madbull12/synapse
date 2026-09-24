package handlers

import (
	"errors"
	"server/internal/apperr"
	"server/internal/apputil"
	"server/internal/dto"
	"server/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChannelHandler struct {
	channelService service.ChannelService
}

func NewChannelHandler(channelService service.ChannelService) *ChannelHandler {
	return &ChannelHandler{
		channelService: channelService,
	}
}

func (h *ChannelHandler) HandleCreateChannel(c *gin.Context) {
	workspaceIdStr := c.Param("workspaceId")
	workspaceId, err := uuid.Parse(workspaceIdStr)
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_WORKSPACE_ID", "The provided workspace ID is invalid"))
		return
	}

	userIdVal, exists := c.Get("user_id")
	if !exists {
		dto.RespondError(c, apperr.Unauthorized("UNAUTHORIZED", "Authentication required"))
		return
	}
	userId, ok := userIdVal.(uuid.UUID)
	if !ok {
		err := errors.New("type assertion failed: user_id is not a uuid.UUID")
		dto.RespondError(c, apperr.Internal(err, "Failed to parse user session"))
		return
	}

	var req dto.CreateChannelRequest
	if !apputil.BindAndValidate(c, &req) {
		return
	}

	channel, err := h.channelService.CreateChannel(c.Request.Context(), workspaceId, userId, req)
	if err != nil {
		dto.RespondError(c, err)
		return
	}
	dto.RespondSuccess(c, 201,"Channel created successfully", channel)

}