package middleware

import (
	"strings"

	"server/internal/apperr"
	"server/internal/dto"
	"server/internal/utils"

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
        var tokenStr string

        // Protected routes only care about the Authorization Bearer header!
        authHeader := c.GetHeader(AuthorizationHeader)
        if authHeader != "" {
            parts := strings.Split(authHeader, " ")
            if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
                tokenStr = parts[1]
            }
        }

        if tokenStr == "" {
            dto.RespondError(c, apperr.Unauthorized("UNAUTHORIZED", "Authentication required. Please log in."))
            c.Abort()
            return
        }

        claims, err := utils.ValidateToken(tokenStr)
        if err != nil {
            dto.RespondError(c, apperr.Unauthorized("TOKEN_EXPIRED", "Session expired or invalid. Please log in again."))
            c.Abort()
            return
        }

        c.Set(ContextUserIDKey, claims.UserID)
        c.Set(ContextUserEmailKey, claims.Email)

        c.Next()
    }
}