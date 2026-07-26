package middleware

import (
	"net/http"
	"strings"

	"server/internal/utils"

	"github.com/gin-gonic/gin"
)

const (
	AuthorizationHeader = "Authorization"
	CookieName          = "synapse_session"
	ContextUserIDKey    = "userID"
	ContextUserEmailKey = "userEmail"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenStr string

		if cookie, err := c.Cookie(CookieName); err == nil && cookie != "" {
			tokenStr = cookie
		} else {
			authHeader := c.GetHeader(AuthorizationHeader)
			if authHeader != "" {
				parts := strings.Split(authHeader, " ")
				if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
					tokenStr = parts[1]
				}
			}
		}

		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required. Please log in.",
			})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Session expired or invalid. Please log in again.",
			})
			c.Abort()
			return
		}

		c.Set(ContextUserIDKey, claims.UserID)
		c.Set(ContextUserEmailKey, claims.Email)

		c.Next()
	}
}