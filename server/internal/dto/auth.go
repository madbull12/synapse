// dto/auth.go

package dto

// Service layer result (used internally by handler to set cookie)
type AuthResult struct {
	AccessToken  string           `json:"access_token"`
	RefreshToken string           `json:"-"` // Handled via HttpOnly cookie
	UserID       string 		   `json:"user_id"`
}
type RegisterRequest struct {
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=Password"`
}

type AuthResponse struct {
    Token string   `json:"access_token"`
    UserID  string `json:"user_id"`
}

type UserData struct {
    ID    string `json:"id"`
    Email string `json:"email"`
}