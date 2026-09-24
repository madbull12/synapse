package dto

type CreateChannelRequest struct {
	Name  string `json:"name" binding:"required,min=1,max=100"`
	Topic string `json:"topic" binding:"max=255"`
	Type  string `json:"type" binding:"required,oneof=PUBLIC PRIVATE"`
}