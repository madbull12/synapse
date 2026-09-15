package handlers

import (
	"log"
	"net/http"
	"os"
	"server/internal/apperr"
	"server/internal/dto"
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
		// Uses your MapValidationErrors to map struct tag failures automatically
		fieldErrors := dto.MapValidationErrors(err)
		
		var appFieldErrors []apperr.FieldError
		for _, fe := range fieldErrors {
			appFieldErrors = append(appFieldErrors, apperr.FieldError{
				Field:   fe.Field,
				Message: fe.Message,
			})
		}
		
		dto.RespondError(c, apperr.ValidationError(appFieldErrors))
		return
	}
	result, err := h.srv.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		dto.RespondError(c,err)
		return
	}

	isProduction := os.Getenv("ENV") == "production"

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"refresh_token",
		result.RefreshToken,
		7*24*3600,
		"/",
		"",
		isProduction,
		true,
	)

	c.SetCookie(
		"access_token",
		result.AccessToken,
		15*60,
		"/",
        "",
        isProduction,
        true,
	)

	
	dto.RespondSuccess(c,http.StatusOK,"Login Successful",dto.AuthResponse{
		UserID: result.UserID,
	})
}

func (h *AuthHandler) HandleRegister(c *gin.Context) {
	var req authRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		// Uses your MapValidationErrors to map struct tag failures automatically
		fieldErrors := dto.MapValidationErrors(err)
		
		var appFieldErrors []apperr.FieldError
		for _, fe := range fieldErrors {
			appFieldErrors = append(appFieldErrors, apperr.FieldError{
				Field:   fe.Field,
				Message: fe.Message,
			})
		}
		
		dto.RespondError(c, apperr.ValidationError(appFieldErrors))
		return
	}

	result, err := h.srv.Register(c.Request.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		dto.RespondError(c, err)
		return
	}
	isProduction := os.Getenv("ENV") == "production"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"refresh_token",
		result.RefreshToken,
		7*24*3600,
		"/",
		"",
		isProduction,
		true,
	)
	c.SetCookie(
        "access_token",
        result.AccessToken,
        15*60,
        "/",
        "",
        isProduction,
        true,
    )
	dto.RespondSuccess(c, http.StatusCreated, "Account successfully created", dto.AuthResponse{
		// Token:  result.AccessToken,
		UserID: result.UserID,
	})
}
func (h *AuthHandler) HandleLogout(c *gin.Context) {
    isProduction := os.Getenv("ENV") == "production"
    c.SetSameSite(http.SameSiteLaxMode)

    refreshToken, err := c.Cookie("refresh_token")
	log.Printf("Refresh Token: %s", refreshToken)
    if err == nil && refreshToken != "" {
        if err := h.srv.Logout(c.Request.Context(), refreshToken); err != nil {
            c.SetCookie("refresh_token", "", -1, "/", "", isProduction, true)
            
            dto.RespondError(c, err)
            return
        }
    }

    c.SetCookie(
        "refresh_token",
        "",
        -1,
        "/",
        "",
        isProduction,
        true,
    )	
	c.SetCookie("access_token", "", -1, "/", "", isProduction, true)
    dto.RespondSuccess(c, http.StatusOK, "Logout successful", nil)
}

func (h *AuthHandler) HandleRefresh(c *gin.Context) {
    refreshToken, err := c.Cookie("refresh_token")
    if err != nil || refreshToken == "" {
     dto.RespondError(c, apperr.Unauthorized("MISSING_REFRESH_TOKEN", "Refresh token is missing or invalid"))
        return
    }

    newAccessToken, newRefreshToken, err := h.srv.RefreshToken(c.Request.Context(), refreshToken)
    if err != nil {
        c.SetCookie("refresh_token", "", -1, "/", "", true, true)

        dto.RespondError(c, apperr.Unauthorized("INVALID_REFRESH_TOKEN", "Refresh token is invalid or has expired"))
        return
    }
	isProduction := os.Getenv("ENV") == "production"
    c.SetSameSite(http.SameSiteLaxMode)
    c.SetCookie("refresh_token", newRefreshToken, 3600*24*7, "/", "", true, true)
	c.SetCookie("access_token", newAccessToken, 15*60, "/", "", isProduction, true)

 	 dto.RespondSuccess(c, http.StatusOK, "Token refreshed successfully", nil)
}