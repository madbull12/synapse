package handlers

import (
	"net/http"
	"server/internal/apperr"
	"server/internal/apputil"
	"server/internal/dto"
	"server/internal/service"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MessageHandler struct {
	messageService service.MessageService
}

func NewMessageHandler(messageService service.MessageService) *MessageHandler {
	return &MessageHandler{
		messageService: messageService,
	}
}

func (h *MessageHandler) HandleSendMessage(c *gin.Context) {
	channelIdParam := c.Param("channel_id")
	channelId, err := uuid.Parse(channelIdParam)
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_ID", "Invalid channel ID format"))
		return
	}

	userId, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	var req dto.SendMessageRequest
	if !apputil.BindAndValidate(c, &req) {
		return
	}

	message, err := h.messageService.SendMessage(c.Request.Context(), channelId, userId, req.Content)
	if err != nil {
		dto.RespondError(c, err)
		return
	}
	dto.RespondSuccess(c, http.StatusOK, "Message sent", message)

}

func (h *MessageHandler) HandleGetChannelMessages(c *gin.Context) {
	// 1. Parse and validate channel ID from route params
	channelIdParam := c.Param("channel_id")
	channelId, err := uuid.Parse(channelIdParam)
	if err != nil {
		dto.RespondError(c, apperr.BadRequest("INVALID_ID", "Invalid channel ID format"))
		return
	}

	// 2. Retrieve authenticated user ID using apputil helper
	userId, err := apputil.GetUserID(c)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	// 3. Parse optional cursor parameter (`before`)
	var beforePtr *time.Time
	if beforeQuery := c.Query("before"); beforeQuery != "" {
		parsedTime, err := time.Parse(time.RFC3339, beforeQuery)
		if err != nil {
			dto.RespondError(c, apperr.BadRequest("INVALID_TIMESTAMP", "Invalid 'before' timestamp format, must be RFC3339"))
			return
		}
		beforePtr = &parsedTime
	}

	// 4. Parse optional limit parameter with a default fallback
	limit := 50
	if limitQuery := c.Query("limit"); limitQuery != "" {
		if parsedLimit, err := strconv.Atoi(limitQuery); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// 5. Delegate to service layer
	result, err := h.messageService.GetChannelMessages(c.Request.Context(), channelId, userId, beforePtr, limit)
	if err != nil {
		dto.RespondError(c, err)
		return
	}

	// 6. Respond with success helper
	dto.RespondSuccess(c, http.StatusOK, "Messages retrieved successfully", result)
}
