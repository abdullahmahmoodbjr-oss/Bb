# Get your MCP server URL for ChatGPT

Follow this exactly. You only get a real ChatGPT MCP URL **after** the server is running and exposed with HTTPS.

## What URL do I need?

ChatGPT needs a public HTTPS URL that ends with `/mcp`.

Example final URL:

```text
https://abc123.ngrok-free.app/mcp
```

Your URL will not be exactly `abc123`; ngrok gives you your own domain.

## Before Step 1: Open a terminal in this project

If you do not know how to open a terminal, follow [`OPEN_TERMINAL.md`](OPEN_TERMINAL.md) first. Then come back here.

## Step 1: Install Node.js

Install **Node.js 20 or newer** from:

```text
https://nodejs.org/
```

Check it works:

```bash
node --version
npm --version
```

## Step 2: Open this project in a terminal

Go to the folder that contains this repository. Then run:

```bash
npm install
npm run install:browsers
```

## Step 3: Start the MCP server

Run:

```bash
npm run dev
```

Keep this terminal open. If it works, you should see something like:

```text
Google Browser MCP listening on http://localhost:3000/mcp
```

This local URL is only for your computer:

```text
http://localhost:3000/mcp
```

Do **not** paste the localhost URL into ChatGPT unless ChatGPT specifically says it can use local/tunnel mode. Most of the time ChatGPT needs HTTPS.

## Step 4: Create the public HTTPS URL with ngrok

Open a **second** terminal. Do not close the first terminal.

Install or open ngrok, then run:

```bash
ngrok http 3000
```

Ngrok will show a line like:

```text
Forwarding  https://abc123.ngrok-free.app  ->  http://localhost:3000
```

Copy only the HTTPS part:

```text
https://abc123.ngrok-free.app
```

Add `/mcp` to the end:

```text
https://abc123.ngrok-free.app/mcp
```

That is your MCP server URL for ChatGPT.

## Step 5: Let the helper print the exact URL

After both terminals are running, open a third terminal in this project and run:

```bash
npm run mcp:url
```

If ngrok is running, it prints your real ChatGPT URL. If it prints `YOUR-NGROK-URL`, ngrok is not running or the ngrok local API is unavailable.

## Step 6: Test the URL before adding it to ChatGPT

Open this URL in your browser, replacing the domain with your ngrok domain:

```text
https://abc123.ngrok-free.app/health
```

You should see JSON with:

```json
{
  "ok": true,
  "mcpUrl": "/mcp"
}
```

If `/health` does not work, ChatGPT will not connect either.

## Step 7: Fill the ChatGPT New App screen

Use these values:

| ChatGPT field | Value |
| --- | --- |
| **Name** | `Google Browser Agent` |
| **Description** | `Supervised browser helper for Google pages and forms. Requires my approval before final submit or send.` |
| **Connection** | `Server URL` |
| **Server URL** | Your ngrok URL ending in `/mcp`, for example `https://abc123.ngrok-free.app/mcp` |
| **Authentication** | `No authentication` / `None`, if available |
| **Risk checkbox** | Check `I understand and want to continue` |

Then press **Create**.

## If ChatGPT asks for `/sse` instead

Use the same ngrok domain but end it with `/sse`:

```text
https://abc123.ngrok-free.app/sse
```

## If the Create button is disabled

Check these common problems:

1. The URL must start with `https://`, not `http://`.
2. The URL should usually end with `/mcp`.
3. The first terminal must still be running `npm run dev`.
4. The second terminal must still be running `ngrok http 3000`.
5. The risk checkbox must be checked.
6. If ChatGPT only allows OAuth and has no `None` option, this starter server will need OAuth added before ChatGPT accepts it.

## The short version

Terminal 1:

```bash
npm install
npm run install:browsers
npm run dev
```

Terminal 2:

```bash
ngrok http 3000
```

Terminal 3:

```bash
npm run mcp:url
```

Paste the printed HTTPS `/mcp` URL into ChatGPT.
