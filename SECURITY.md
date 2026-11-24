# Security

## Built in
- Strict Content-Security-Policy (no inline scripts, no external origins) and `no-referrer`.
- All user text is rendered with `textContent`, never `innerHTML`, and stripped of `<`, `>` and control characters.
- Input validation (Kenyan phone format, length limits) and report rate limiting.
- Scam/phishing heuristics for SMS and links.

## Required before production
- Server-side validation, rate limiting and CAPTCHA on the report endpoint.
- Staff login with unique passwords and two-step verification; role-based access.
- HTTPS + HSTS; store only needed personal data (phone, GPS) and encrypt it at rest.
- Sign outgoing alert SMS from one verified sender ID so fake alerts are recognisable.
- Audit log of who changed a report status; regular dependency and secret scans.

Report vulnerabilities privately to the repository owner.
