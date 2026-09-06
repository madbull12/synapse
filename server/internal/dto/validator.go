package dto

import (
	"errors"
	"fmt"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

func MapValidationErrors(err error) []FieldError {
	var fieldErrors []FieldError
	var ve validator.ValidationErrors

	if errors.As(err, &ve) {
		for _, fe := range ve {
			fieldErrors = append(fieldErrors, FieldError{
				Field:   toSnakeCase(fe.Field()),
				Message: formatTagMessage(fe),
			})
		}
		return fieldErrors
	}

	// Fallback when JSON syntax is malformed (e.g., syntax error in raw body)
	return []FieldError{
		{Field: "body", Message: "Invalid JSON format or malformed request payload"},
	}
}

func formatTagMessage(fe validator.FieldError) string {
	field := toSnakeCase(fe.Field())

	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return "Invalid email format"
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", field, fe.Param())
	case "max":
		return fmt.Sprintf("%s must not exceed %s characters", field, fe.Param())
	case "eqfield":
		return fmt.Sprintf("%s must match %s", field, toSnakeCase(fe.Param()))
	default:
		return fmt.Sprintf("%s is invalid", field)
	}
}

func toSnakeCase(str string) string {
	var result strings.Builder
	for i, r := range str {
		if unicode.IsUpper(r) {
			if i > 0 {
				result.WriteRune('_')
			}
			result.WriteRune(unicode.ToLower(r))
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}