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
        var token string

        // 1. Try checking the Authorization header first (used by Next.js SSR fetch)
        authHeader := c.GetHeader("Authorization")
        if strings.HasPrefix(authHeader, "Bearer ") {
            token = strings.TrimPrefix(authHeader, "Bearer ")
        }

        // 2. If no header is present, fallback to checking the HttpOnly cookie (used by Client fetch)
        if token == "" {
            cookieToken, err := c.Cookie("access_token")
            if err == nil {
                token = cookieToken
            }
        }

        // 3. If neither exists, reject with 401
        if token == "" {
            dto.RespondError(c, apperr.Unauthorized("UNAUTHORIZED", "Missing access token"))
            c.Abort()
            return
        }

        // 4. Validate the token string
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