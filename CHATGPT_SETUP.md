# Add this MCP server to ChatGPT

This guide matches the **New App** window in your screenshot.

## 0. First get your MCP URL

If you only want the full step-by-step URL process, start with [`GET_MCP_SERVER_URL.md`](GET_MCP_SERVER_URL.md). The final URL you need will look like `https://abc123.ngrok-free.app/mcp`.

## 1. Start the MCP server

Open a terminal in this repository and run:

```bash
npm install
npm run install:browsers
cp .env.example .env
npm run dev
```

Leave that terminal open. The server runs at:

```text
http://localhost:3000/mcp
```

## 2. Create the public HTTPS URL ChatGPT needs

ChatGPT cannot normally connect to your private `localhost` URL from the web UI. In a second terminal, run:

```bash
ngrok http 3000
```

Ngrok will show a public HTTPS forwarding URL. It looks like this:

```text
https://abc123.ngrok-free.app
```

Add `/mcp` to the end. That is the URL to paste into ChatGPT:

```text
https://abc123.ngrok-free.app/mcp
```

If ChatGPT's form specifically asks for an SSE URL, use `/sse` instead:

```text
https://abc123.ngrok-free.app/sse
```

## 3. Fill the ChatGPT **New App** form

Use these exact values:

| Field in ChatGPT | What to enter |
| --- | --- |
| **Name** | `Google Browser Agent` |
| **Description** | `Supervised browser helper for Google pages and forms. Requires my approval before final submit or send.` |
| **Connection** | Keep **Server URL** selected. |
| **Server URL** | Paste your ngrok URL ending in `/mcp`, for example `https://abc123.ngrok-free.app/mcp`. |
| **Authentication** | Select **No authentication** or **None** if that option is available. |
| **Risk checkbox** | Check **I understand and want to continue**. |

Then press **Create**.

## 4. If your screen only shows OAuth

This local starter server is meant for your own private supervised use and does not require OAuth. If the dropdown is currently set to **OAuth**, tap it and look for **No authentication** or **None**.

If ChatGPT does not offer a no-auth option for your account, you will need to add OAuth before ChatGPT accepts the app. Do not put random OAuth values into the advanced settings; they will not work.

## 5. Check that the URL is alive

Open this in your browser, replacing the domain with your ngrok domain:

```text
https://abc123.ngrok-free.app/health
```

You should see JSON containing:

```json
{
  "ok": true,
  "mcpUrl": "/mcp",
  "legacySseUrl": "/sse"
}
```

## 6. Use it in ChatGPT

After creating the app, start a new ChatGPT chat and enable/select **Google Browser Agent** from the tools/apps menu. Try:

```text
Open Google Forms and help me fill a form, but stop before submitting so I can review it.
```

The server is designed to stop before final submit/send actions. You must approve the confirmation token before it clicks the final button.

## Quick helper command

After `ngrok http 3000` is running, this command prints the exact values to paste into ChatGPT:

```bash
npm run mcp:url
```
