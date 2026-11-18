package notify

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
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
		log.Printf("booking %d email notification skipped: NOTIFY_EMAIL, SMTP_USER and SMTP_PASS must be set", b.ID)
		return
	}
	from := c.SMTPFrom
	if from == "" {
		from = c.SMTPUser
	}
	messageID := fmt.Sprintf("<%d.%d@%s>", b.ID, time.Now().UnixNano(), c.SMTPHost)
	subject := "New booking request from " + headerSafe(b.CustomerName)
	body := bookingText(b)
	msg := []byte(
		"From: " + headerSafe(from) + "\r\n" +
			"To: " + headerSafe(c.NotifyEmail) + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"Message-ID: " + messageID + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=UTF-8\r\n" +
			"\r\n" + body + "\r\n",
	)
	log.Printf("booking %d email notification starting: from=%s to=%s host=%s port=%s message_id=%s", b.ID, from, c.NotifyEmail, c.SMTPHost, c.SMTPPort, messageID)
	if err := n.sendSMTP(from, c.NotifyEmail, messageID, msg); err != nil {
		log.Printf("booking %d email notification failed: %v", b.ID, err)
		return
	}
	log.Printf("booking %d email notification sent to %s message_id=%s", b.ID, c.NotifyEmail, messageID)
}

type smtpLogConn struct {
	net.Conn
}

func (c smtpLogConn) Read(b []byte) (int, error) {
	n, err := c.Conn.Read(b)
	if n > 0 {
		log.Printf("smtp <- %s", strings.TrimSpace(string(b[:n])))
	}
	return n, err
}

func (n *Notifier) sendSMTP(from, to, messageID string, msg []byte) error {
	c := n.cfg
	addr := net.JoinHostPort(c.SMTPHost, c.SMTPPort)
	log.Printf("smtp phase=connect addr=%s", addr)
	dialer := &net.Dialer{Timeout: 10 * time.Second}
	conn, err := dialer.Dial("tcp", addr)
	if err != nil {
		log.Printf("smtp phase=connect failed: %v", err)
		return err
	}
	defer conn.Close()

	client, err := smtp.NewClient(smtpLogConn{Conn: conn}, c.SMTPHost)
	if err != nil {
		log.Printf("smtp phase=new_client failed: %v", err)
		return err
	}
	defer client.Close()

	if err := client.Hello("localhost"); err != nil {
		log.Printf("smtp phase=hello failed: %v", err)
		return err
	}
	log.Printf("smtp phase=hello ok")

	if ok, _ := client.Extension("STARTTLS"); ok {
		if err := client.StartTLS(&tls.Config{ServerName: c.SMTPHost, MinVersion: tls.VersionTLS12}); err != nil {
			log.Printf("smtp phase=starttls failed: %v", err)
			return err
		}
		log.Printf("smtp phase=starttls ok")
		if err := client.Hello("localhost"); err != nil {
			log.Printf("smtp phase=hello_after_tls failed: %v", err)
			return err
		}
		log.Printf("smtp phase=hello_after_tls ok")
	}

	if err := client.Auth(smtp.PlainAuth("", c.SMTPUser, c.SMTPPass, c.SMTPHost)); err != nil {
		log.Printf("smtp phase=auth failed: %v", err)
		return err
	}
	log.Printf("smtp phase=auth ok")

	if err := client.Mail(from); err != nil {
		log.Printf("smtp phase=mail_from from=%s failed: %v", from, err)
		return err
	}
	log.Printf("smtp phase=mail_from from=%s ok", from)

	if err := client.Rcpt(to); err != nil {
		log.Printf("smtp phase=rcpt_to to=%s failed: %v", to, err)
		return err
	}
	log.Printf("smtp phase=rcpt_to to=%s ok", to)

	w, err := client.Data()
	if err != nil {
		log.Printf("smtp phase=data_open failed: %v", err)
		return err
	}
	if _, err := w.Write(msg); err != nil {
		log.Printf("smtp phase=data_write failed: %v", err)
		w.Close()
		return err
	}
	if err := w.Close(); err != nil {
		log.Printf("smtp phase=data_close message_id=%s failed: %v", messageID, err)
		return err
	}
	log.Printf("smtp phase=data_close message_id=%s ok", messageID)

	if err := client.Quit(); err != nil {
		log.Printf("smtp phase=quit failed: %v", err)
		return err
	}
	log.Printf("smtp phase=quit ok")
	return nil
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
	case "textbee":
		n.sendTextbee(text)
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

func (n *Notifier) sendTextbee(text string) {
	c := n.cfg
	if c.TextbeeAPIKey == "" {
		return
	}
	payload := map[string]any{
		"message":    text,
		"recipients": []string{c.NotifyPhone},
	}
	if c.TextbeeDeviceID != "" {
		payload["deviceId"] = c.TextbeeDeviceID
	}
	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("booking sms notification failed: %v", err)
		return
	}
	endpoint := strings.TrimRight(c.TextbeeBaseURL, "/") + "/gateway/send-sms"
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		log.Printf("booking sms notification failed: %v", err)
		return
	}
	req.Header.Set("x-api-key", c.TextbeeAPIKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	resp, err := n.client.Do(req)
	if err != nil {
		log.Printf("booking sms notification failed: %v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		response, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		var detail struct {
			Message string `json:"message"`
		}
		_ = json.Unmarshal(response, &detail)
		if detail.Message != "" {
			log.Printf("booking sms notification failed: textbee: %s", detail.Message)
			return
		}
		log.Printf("booking sms notification failed: textbee returned %s: %s", resp.Status, strings.TrimSpace(string(response)))
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
