package apperr

import "net/http"

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type AppError struct {
	StatusCode int          `json:"-"`
	Code       string       `json:"code"`
	Message    string       `json:"message"`
	Fields     []FieldError `json:"fields,omitempty"`
	Err        error        `json:"-"`
}

func (e *AppError) Error() string { return e.Message }

func BadRequest(code, message string) *AppError {
	return &AppError{
		StatusCode: http.StatusBadRequest,
		Code:       code,
		Message:    message,
	}
}

func Unauthorized(code, message string) *AppError {
	return &AppError{
		StatusCode: http.StatusUnauthorized,
		Code:       code,
		Message:    message,
	}
}

func Forbidden(code, message string) *AppError {
	return &AppError{
		StatusCode: http.StatusForbidden,
		Code:       code,
		Message:    message,
	}
}

func NotFound(code, message string) *AppError {
	return &AppError{
		StatusCode: http.StatusNotFound,
		Code:       code,
		Message:    message,
	}
}

func Conflict(code, message string) *AppError {
	return &AppError{
		StatusCode: http.StatusConflict,
		Code:       code,
		Message:    message,
	}
}

func ValidationError(fields []FieldError) *AppError {
	return &AppError{
		StatusCode: http.StatusUnprocessableEntity,
		Code:       "VALIDATION_ERROR",
		Message:    "Validation failed",
		Fields:     fields,
	}
}

func Internal(err error, customMsg ...string) *AppError {
    message := "An unexpected error occurred. Please try again later."
    
    if len(customMsg) > 0 && customMsg[0] != "" {
        message = customMsg[0]
    }

    return &AppError{
        StatusCode: http.StatusInternalServerError,
        Code:       "INTERNAL_ERROR",
        Message:    message, 
        Err:        err,    
    }
}