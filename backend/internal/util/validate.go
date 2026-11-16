package util

import (
	"net/mail"
	"regexp"
	"strings"
)

var phoneRe = regexp.MustCompile(`^[0-9+\-\s]{7,20}$`)

func Clean(s string) string { return strings.TrimSpace(s) }

func ValidEmail(email string) bool {
	if email == "" {
		return true
	}
	_, err := mail.ParseAddress(email)
	return err == nil
}

func ValidPhone(phone string) bool {
	phone = strings.TrimSpace(phone)
	return phone != "" && phoneRe.MatchString(phone)
}
