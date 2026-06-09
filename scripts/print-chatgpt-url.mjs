#!/usr/bin/env node
const port = process.env.PORT ?? "3000";
const localBase = `http://localhost:${port}`;
const localMcp = `${localBase}/mcp`;
const localSse = `${localBase}/sse`;
const isDoctor = process.argv.includes("--doctor");

async function checkUrl(url) {
  try {
    const response = await fetch(url);
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function getNgrokUrl() {
  try {
    const response = await fetch("http://127.0.0.1:4040/api/tunnels");
    if (!response.ok) return undefined;
    const data = await response.json();
    const tunnel = data.tunnels?.find((item) => item.public_url?.startsWith("https://"));
    return tunnel?.public_url;
  } catch {
    return undefined;
  }
}

const localHealth = await checkUrl(`${localBase}/health`);
const ngrokUrl = await getNgrokUrl();
const publicMcp = ngrokUrl ? `${ngrokUrl}/mcp` : "https://YOUR-NGROK-URL.ngrok-free.app/mcp";
const publicSse = ngrokUrl ? `${ngrokUrl}/sse` : "https://YOUR-NGROK-URL.ngrok-free.app/sse";
const publicHealth = ngrokUrl ? `${ngrokUrl}/health` : "https://YOUR-NGROK-URL.ngrok-free.app/health";
const publicHealthCheck = ngrokUrl ? await checkUrl(publicHealth) : undefined;

function statusLine(label, result, fix) {
  const passed = result?.ok;
  const detail = result?.status ? `HTTP ${result.status}` : result?.error;
  console.log(`${passed ? "✅" : "❌"} ${label}${detail ? ` (${detail})` : ""}`);
  if (!passed && fix) console.log(`   Fix: ${fix}`);
}

if (isDoctor) {
  console.log("MCP URL doctor\n");
  statusLine("Local MCP server /health", localHealth, "Run `npm run dev` in another terminal and leave it open.");
  if (ngrokUrl) {
    console.log(`✅ ngrok HTTPS tunnel found: ${ngrokUrl}`);
    statusLine("Public ngrok /health", publicHealthCheck, "Make sure ngrok is forwarding to port 3000.");
  } else {
    console.log("❌ ngrok HTTPS tunnel not found");
    console.log(`   Fix: Run \`ngrok http ${port}\` in a second terminal.`);
  }
  console.log("\nIf all checks are green, paste this into ChatGPT:");
  console.log(`  ${publicMcp}\n`);
  process.exit(localHealth.ok && ngrokUrl && publicHealthCheck?.ok ? 0 : 1);
}

console.log(`
Paste this into ChatGPT's New App form:

Name:
  Google Browser Agent

Description:
  Supervised browser helper for Google pages and forms. Requires my approval before final submit or send.

Connection tab:
  Server URL

Server URL:
  ${publicMcp}

Authentication:
  No authentication / None

Safety checkbox:
  Check "I understand and want to continue"

Test URL in your browser first:
  ${publicHealth}

If ChatGPT specifically asks for an SSE URL instead, use:
  ${publicSse}

Local-only URLs, useful for testing before ngrok:
  ${localMcp}
  ${localSse}

Current checks:
  ${localHealth.ok ? "✅" : "❌"} Local server ${localHealth.ok ? "is running" : "is not reachable"}
  ${ngrokUrl ? "✅" : "❌"} ngrok tunnel ${ngrokUrl ? "found" : "not found"}

If the HTTPS URL above still says YOUR-NGROK-URL:
  1. Keep \`npm run dev\` running in terminal 1.
  2. Run \`ngrok http ${port}\` in terminal 2.
  3. Run \`npm run mcp:url\` again in terminal 3.

For the full beginner guide, open:
  GET_MCP_SERVER_URL.md
`);
