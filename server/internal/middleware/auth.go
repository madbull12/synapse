package middleware

import (
	"server/internal/apperr"
	"server/internal/dto"
	"server/internal/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	AuthorizationHeader = "Authorization"
	CookieName          = "refresh_token"
	ContextUserIDKey    = "userID"
	ContextUserEmailKey = "userEmail"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			dto.RespondError(c, apperr.Unauthorized("UNAUTHORIZED", "Missing access token"))
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(token)
		if err != nil {
			dto.RespondError(c, apperr.Unauthorized("TOKEN_EXPIRED", "Session expired or invalid."))
			c.Abort()
			return
		}

		c.Set(ContextUserIDKey, claims.UserID)
		c.Set(ContextUserEmailKey, claims.Email)
		c.Next()
	}
}

func extractToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}

	if cookieToken, err := c.Cookie("access_token"); err == nil && cookieToken != "" {
		return cookieToken
	}

	if queryToken := c.Query("token"); queryToken != "" {
		return queryToken
	}

	return ""
}