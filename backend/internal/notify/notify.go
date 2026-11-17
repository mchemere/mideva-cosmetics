package notify

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/smtp"
	"net/url"
	"strings"
	"time"

	"github.com/mchemere/gifted-hands/backend/internal/config"
	"github.com/mchemere/gifted-hands/backend/internal/models"
)

type Notifier struct {
	cfg    *config.Config
	client *http.Client
}

func New(cfg *config.Config) *Notifier {
	return &Notifier{
		cfg:    cfg,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (n *Notifier) Booking(b models.Booking) {
	if n == nil || n.cfg == nil {
		return
	}
	go n.sendEmail(b)
	go n.sendSMS(b)
}

func (n *Notifier) sendEmail(b models.Booking) {
	c := n.cfg
	if c.NotifyEmail == "" || c.SMTPUser == "" || c.SMTPPass == "" {
		return
	}
	from := c.SMTPFrom
	if from == "" {
		from = c.SMTPUser
	}
	subject := "New booking request from " + headerSafe(b.CustomerName)
	body := bookingText(b)
	msg := []byte(
		"From: " + headerSafe(from) + "\r\n" +
			"To: " + headerSafe(c.NotifyEmail) + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=UTF-8\r\n" +
			"\r\n" + body + "\r\n",
	)
	addr := c.SMTPHost + ":" + c.SMTPPort
	auth := smtp.PlainAuth("", c.SMTPUser, c.SMTPPass, c.SMTPHost)
	if err := smtp.SendMail(addr, auth, from, []string{c.NotifyEmail}, msg); err != nil {
		log.Printf("booking email notification failed: %v", err)
	}
}

func (n *Notifier) sendSMS(b models.Booking) {
	c := n.cfg
	if c.NotifyPhone == "" {
		return
	}
	text := bookingText(b)
	switch strings.ToLower(c.SMSProvider) {
	case "twilio":
		n.sendTwilio(text)
	default:
		n.sendAfricasTalking(text)
	}
}

func (n *Notifier) sendAfricasTalking(text string) {
	c := n.cfg
	if c.ATUsername == "" || c.ATApiKey == "" {
		return
	}
	form := url.Values{}
	form.Set("username", c.ATUsername)
	form.Set("to", c.NotifyPhone)
	form.Set("message", text)
	if c.ATSender != "" {
		form.Set("from", c.ATSender)
	}
	endpoint := "https://api.africastalking.com/version1/messaging"
	if strings.EqualFold(c.ATUsername, "sandbox") {
		endpoint = "https://api.sandbox.africastalking.com/version1/messaging"
	}
	req, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		log.Printf("booking sms notification failed: %v", err)
		return
	}
	req.Header.Set("apiKey", c.ATApiKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := n.client.Do(req)
	if err != nil {
		log.Printf("booking sms notification failed: %v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		log.Printf("booking sms notification failed: Africa's Talking returned %s: %s", resp.Status, strings.TrimSpace(string(body)))
	}
}

func (n *Notifier) sendTwilio(text string) {
	c := n.cfg
	if c.TwilioSID == "" || c.TwilioToken == "" || c.TwilioFrom == "" {
		return
	}
	endpoint := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", c.TwilioSID)
	form := url.Values{}
	form.Set("To", c.NotifyPhone)
	form.Set("From", c.TwilioFrom)
	form.Set("Body", text)
	req, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		log.Printf("booking sms notification failed: %v", err)
		return
	}
	req.SetBasicAuth(c.TwilioSID, c.TwilioToken)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := n.client.Do(req)
	if err != nil {
		log.Printf("booking sms notification failed: %v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		log.Printf("booking sms notification failed: Twilio returned %s", resp.Status)
	}
}

func bookingText(b models.Booking) string {
	var sb strings.Builder
	sb.WriteString("New booking request\n")
	sb.WriteString("Name: " + b.CustomerName + "\n")
	sb.WriteString("Phone: " + b.PhoneNumber + "\n")
	if b.Email != nil && *b.Email != "" {
		sb.WriteString("Email: " + *b.Email + "\n")
	}
	sb.WriteString("Service: " + b.ServiceName + "\n")
	sb.WriteString("Preferred: " + b.PreferredDate + " " + b.PreferredTime + "\n")
	if b.Message != nil && *b.Message != "" {
		sb.WriteString("Message: " + *b.Message + "\n")
	}
	return sb.String()
}

func headerSafe(s string) string {
	s = strings.ReplaceAll(s, "\r", " ")
	s = strings.ReplaceAll(s, "\n", " ")
	return s
}
