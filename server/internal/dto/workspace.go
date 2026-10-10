package dto

type InvitationDetails struct {
	Email          string `json:"email" binding:"required,email"`
	WorkspaceName  string `json:"workspace_name"`
	IsExistingUser bool   `json:"is_existing_user"`
	Role           string `json:"role"`
}

type CreateWorkspaceRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=100"`
	Slug    string `json:"slug" binding:"required,min=2,max=100"`
	LogoURL string `json:"logo_url"`
}

type AddWorkspaceMemberRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role"` // e.g., "member", "admin"
}

type SendInvitationRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"omitempty,oneof=member admin"`
}
