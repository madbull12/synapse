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

type ChannelHandler struct {
	channelService service.ChannelService
}

func NewChannelHandler(channelService service.ChannelService) *ChannelHandler {
	return &ChannelHandler{
		channelService: channelService,
	}
}

func (h *ChannelHandler) HandleCreateChannel(c *gin.Context) {
	userId, err := apputil.GetUserID(c)

	if err != nil {
		dto.RespondError(c, err)
		return
	}
	workspaceIdStr := c.Param("workspaceId")
	workspaceId, err := uuid.Parse(workspaceIdStr)
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_WORKSPACE_ID", "The provided workspace ID is invalid"))
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
	dto.RespondSuccess(c, 201, "Channel created successfully", channel)

}

func (h *ChannelHandler) HandleGetWorkspaceChannels(c *gin.Context) {
	userId, err := apputil.GetUserID(c)

	if err != nil {
		dto.RespondError(c, err)
		return
	}
	workspaceIdStr := c.Param("workspaceId")
	workspaceId, err := uuid.Parse(workspaceIdStr)
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_WORKSPACE_ID", "The provided workspace ID is invalid"))
		return
	}

	channels, err := h.channelService.GetWorkspaceChannels(c.Request.Context(), workspaceId, userId)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	dto.RespondSuccess(c, http.StatusOK, "Channels retrieved successfully", channels)

}
