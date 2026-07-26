package handlers

import (
	"net/http"
	"server/internal/service"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	srv service.AuthService
}

func NewAuthHandler(srv service.AuthService) *AuthHandler {
	return &AuthHandler{srv: srv}
}

type authRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *AuthHandler) HandleLogin(c *gin.Context) {
	var req authRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request fields supplied"})
		return
	}

	token, err := h.srv.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("synapse_session", token, 86400, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Login authorization granted", "token": token})
}

func (h *AuthHandler) HandleRegister(c *gin.Context) {
	var req authRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request fields supplied"})
		return
	}

	token, err := h.srv.Register(c.Request.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("synapse_session", token, 86400, "/", "", false, true)
	c.JSON(http.StatusCreated, gin.H{"message": "Account successfully created", "token": token})
}

func (h *AuthHandler) HandleLogout(c *gin.Context) {
	token, err := c.Cookie("synapse_session")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No active session found"})
		return
	}

	if err := h.srv.Logout(c.Request.Context(), token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to terminate session"})
		return
	}

	c.SetCookie("synapse_session", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}