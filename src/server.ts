import express, { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type BrowserContext, type Page } from "playwright";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";
const userDataDir = process.env.CHROME_USER_DATA_DIR ?? ".playwright-profile";
const headless = (process.env.HEADLESS ?? "false").toLowerCase() === "true";
const allowedOrigins = (process.env.ALLOWED_ORIGINS ??
  "https://accounts.google.com,https://docs.google.com,https://forms.gle,https://mail.google.com,https://calendar.google.com,https://drive.google.com,https://www.google.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let contextPromise: Promise<BrowserContext> | undefined;
let pagePromise: Promise<Page> | undefined;
let pendingSubmission:
  | {
      token: string;
      selector: string;
      url: string;
      createdAt: string;
    }
  | undefined;

function isAllowedUrl(url: string): boolean {
  const parsed = new URL(url);
  return allowedOrigins.some((origin) => {
    const allowed = new URL(origin);
    return parsed.protocol === allowed.protocol && parsed.hostname === allowed.hostname;
  });
}

function assertAllowedUrl(url: string): void {
  if (!isAllowedUrl(url)) {
    throw new Error(
      `Blocked URL ${url}. Add its origin to ALLOWED_ORIGINS only if you trust ChatGPT to automate it.`,
    );
  }
}

async function getContext(): Promise<BrowserContext> {
  contextPromise ??= chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport: { width: 1440, height: 1000 },
  });
  return contextPromise;
}

async function getPage(): Promise<Page> {
  pagePromise ??= (async () => {
    const context = await getContext();
    const existing = context.pages()[0];
    return existing ?? context.newPage();
  })();
  return pagePromise;
}

async function pageSnapshot(page: Page): Promise<string> {
  const title = await page.title().catch(() => "");
  const url = page.url();
  const fields = await page
    .locator("input, textarea, select, button, [role=button], a")
    .evaluateAll((nodes) =>
      nodes.slice(0, 80).map((node, index) => {
        const element = node as HTMLElement;
        const input = node as HTMLInputElement;
        const label =
          element.getAttribute("aria-label") ??
          element.getAttribute("name") ??
          element.getAttribute("placeholder") ??
          element.textContent?.trim().slice(0, 80) ??
          "";
        return {
          index,
          tag: element.tagName.toLowerCase(),
          type: input.type || undefined,
          selectorHint: element.id ? `#${element.id}` : undefined,
          label,
        };
      }),
    )
    .catch(() => []);

  return JSON.stringify({ title, url, interactiveElements: fields }, null, 2);
}

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "google-browser-agent",
    version: "0.1.0",
  });

  server.tool(
    "open_url",
    "Open an allowed Google URL in a persistent Chromium profile.",
    { url: z.string().url() },
    async ({ url }) => {
      assertAllowedUrl(url);
      const page = await getPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return { content: [{ type: "text", text: await pageSnapshot(page) }] };
    },
  );

  server.tool("current_page", "Return the current page URL, title, and visible form/control hints.", {}, async () => {
    const page = await getPage();
    return { content: [{ type: "text", text: await pageSnapshot(page) }] };
  });

  server.tool(
    "fill_field",
    "Fill a field by CSS selector. Never use this for passwords, 2FA codes, or payment data.",
    { selector: z.string(), value: z.string() },
    async ({ selector, value }) => {
      const page = await getPage();
      assertAllowedUrl(page.url());
      await page.fill(selector, value);
      return { content: [{ type: "text", text: `Filled ${selector}. Review before submitting.` }] };
    },
  );

  server.tool(
    "click_control",
    "Click a non-final control by CSS selector. Use prepare_submit before final submit/send buttons.",
    { selector: z.string() },
    async ({ selector }) => {
      const page = await getPage();
      assertAllowedUrl(page.url());
      await page.click(selector);
      return { content: [{ type: "text", text: await pageSnapshot(page) }] };
    },
  );

  server.tool(
    "prepare_submit",
    "Create a one-time confirmation token for a final submit/send click instead of clicking immediately.",
    { selector: z.string() },
    async ({ selector }) => {
      const page = await getPage();
      assertAllowedUrl(page.url());
      pendingSubmission = {
        token: randomUUID(),
        selector,
        url: page.url(),
        createdAt: new Date().toISOString(),
      };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: "User confirmation required before final submit/send.",
                pendingSubmission,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.tool(
    "confirm_submit",
    "Click the pending final submit/send control only after the user explicitly approves the token.",
    { token: z.string().uuid() },
    async ({ token }) => {
      if (!pendingSubmission || pendingSubmission.token !== token) {
        throw new Error("No matching pending submission token.");
      }
      const page = await getPage();
      assertAllowedUrl(page.url());
      const { selector } = pendingSubmission;
      pendingSubmission = undefined;
      await page.click(selector);
      return { content: [{ type: "text", text: await pageSnapshot(page) }] };
    },
  );

  server.tool("screenshot", "Save a screenshot and return its local path.", {}, async () => {
    const page = await getPage();
    assertAllowedUrl(page.url());
    await mkdir("screenshots", { recursive: true });
    const filePath = path.join("screenshots", `page-${Date.now()}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    return { content: [{ type: "text", text: `Saved screenshot: ${filePath}` }] };
  });

  return server;
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req: Request, res: Response) => {
  res.type("text/plain").send([
    "Google Browser MCP is running.",
    "",
    `Streamable HTTP MCP endpoint: http://localhost:${port}/mcp`,
    `Legacy SSE endpoint: http://localhost:${port}/sse`,
    "",
    "For ChatGPT, expose this server with HTTPS, then paste the HTTPS URL ending in /mcp.",
    "Example: https://YOUR-NGROK-SUBDOMAIN.ngrok-free.app/mcp",
  ].join("\n"));
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, mcpUrl: "/mcp", legacySseUrl: "/sse", allowedOrigins });
});

app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close().catch(() => undefined);
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
});

const sseTransports: Record<string, SSEServerTransport> = {};

app.get("/sse", async (_req: Request, res: Response) => {
  try {
    const server = createMcpServer();
    const transport = new SSEServerTransport("/messages", res);
    sseTransports[transport.sessionId] = transport;
    res.on("close", () => {
      delete sseTransports[transport.sessionId];
    });
    await server.connect(transport);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : undefined;
  const transport = sessionId ? sseTransports[sessionId] : undefined;
  if (!transport) {
    res.status(404).json({ error: "Unknown or missing SSE sessionId." });
    return;
  }
  await transport.handlePostMessage(req, res, req.body);
});

app.listen(port, host, () => {
  const localUrl = `http://localhost:${port}/mcp`;
  console.log(`Google Browser MCP listening on ${localUrl}`);
  console.log(`Legacy SSE endpoint available at http://localhost:${port}/sse`);
  console.log("For ChatGPT, expose this endpoint with HTTPS, for example: ngrok http 3000");
});

process.on("SIGINT", async () => {
  if (contextPromise) {
    const context = await contextPromise;
    await context.close();
  }
  process.exit(0);
});
