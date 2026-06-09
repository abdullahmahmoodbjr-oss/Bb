# ChatGPT Google Browser MCP

This repository contains a guarded Model Context Protocol (MCP) server that lets ChatGPT operate a supervised Chromium browser session for Google pages such as Google Forms, Docs, Gmail, Calendar, Drive, and Search.

> Important: this server does **not** bypass CAPTCHA, passwords, two-factor authentication, Google security checks, or Google terms. Keep the browser visible and review every final submit/send action yourself.

## ChatGPT MCP URL

When you run this server locally, the MCP endpoint is:

```text
http://localhost:3000/mcp
```

ChatGPT generally needs an HTTPS-accessible URL for a custom MCP connector, so expose the local server with a tunnel or deploy it to a host:

```bash
ngrok http 3000
```

After ngrok is running, print the exact form values for ChatGPT:

```bash
npm run mcp:url
```

Use the generated HTTPS forwarding URL with `/mcp` appended, for example:

```text
https://YOUR-NGROK-SUBDOMAIN.ngrok-free.app/mcp
```

That HTTPS `/mcp` URL is the URL to paste into ChatGPT. If the ChatGPT form specifically asks for an SSE URL, use the same HTTPS domain with `/sse` instead.

For the full beginner guide to get your URL, see [`GET_MCP_SERVER_URL.md`](GET_MCP_SERVER_URL.md). For click-by-click setup instructions matching ChatGPT's **New App** screen, see [`CHATGPT_SETUP.md`](CHATGPT_SETUP.md).

If you do not know how to open a terminal in this folder, start with [`OPEN_TERMINAL.md`](OPEN_TERMINAL.md).

## Quick start

```bash
npm install
npm run install:browsers
cp .env.example .env
npm run dev
```

Then open another terminal and expose it:

```bash
ngrok http 3000
```

After ngrok is running, print the exact form values for ChatGPT:

```bash
npm run mcp:url
```

## Tools exposed to ChatGPT

- `open_url` opens an allowed Google URL in Chromium.
- `current_page` returns the page title, URL, and interactive element hints.
- `fill_field` fills a CSS selector with text.
- `click_control` clicks a non-final control.
- `prepare_submit` creates a one-time confirmation token for final submit/send actions.
- `confirm_submit` performs the final submit/send only after you approve the token.
- `screenshot` saves a local screenshot for review.

## Endpoints

- `/mcp` is the preferred Streamable HTTP MCP endpoint for ChatGPT.
- `/sse` is a legacy Server-Sent Events endpoint for clients/forms that specifically ask for SSE.
- `/messages` receives legacy SSE client messages.
- `/health` verifies that the server is reachable.

## Configuration

Copy `.env.example` to `.env` and update these values as needed:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Local HTTP port. |
| `HOST` | `0.0.0.0` | Bind address. |
| `ALLOWED_ORIGINS` | Google origins only | Comma-separated URL origins the browser may automate. |
| `CHROME_USER_DATA_DIR` | `.playwright-profile` | Persistent Chromium profile so you can log in once. |
| `HEADLESS` | `false` | Keep the browser visible for supervision. |

## Safe operating rules

1. Log in to Google manually in the visible browser window.
2. Do not ask ChatGPT to enter passwords, 2FA codes, payment data, or highly sensitive personal data.
3. Use `prepare_submit` for any final submit/send action and approve only after reviewing the page.
4. Prefer official Google APIs for high-volume Workspace automation; this browser MCP is intended for supervised workflows.

## Deploying instead of tunneling

You can deploy this project to any Node.js host that supports Playwright/Chromium. Set `HEADLESS=true` for server deployment and secure the public endpoint before sharing it. If you deploy to a provider, your ChatGPT URL will be:

```text
https://YOUR-DEPLOYED-DOMAIN/mcp
```
