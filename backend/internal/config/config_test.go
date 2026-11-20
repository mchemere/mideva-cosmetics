package config

import "testing"

func TestLoadNormalizesGmailAppPassword(t *testing.T) {
	t.Setenv("SMTP_HOST", "smtp.gmail.com")
	t.Setenv("SMTP_PASS", "gopd hwuq qbur ypba")

	cfg, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.SMTPPass != "gopdhwuqqburypba" {
		t.Fatalf("SMTPPass = %q, want %q", cfg.SMTPPass, "gopdhwuqqburypba")
	}
}

func TestLoadPreservesNonGmailPassword(t *testing.T) {
	t.Setenv("SMTP_HOST", "smtp.example.com")
	t.Setenv("SMTP_PASS", "a b c")

	cfg, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.SMTPPass != "a b c" {
		t.Fatalf("SMTPPass = %q, want %q", cfg.SMTPPass, "a b c")
	}
}
