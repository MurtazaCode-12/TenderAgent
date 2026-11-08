/**
 * Resilient Portal Scraping Client
 * Handles rate limits, exponential backoff retries, user-agent rotation,
 * and external scraping proxy APIs (Firecrawl / Zyte) for Cloudflare/Akamai bypass.
 */

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
];

export interface ScrapeRequestOptions {
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  body?: string;
  maxRetries?: number;
  initialDelayMs?: number;
  useProxyIfAvailable?: boolean;
}

export class ProxyClient {
  private static getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Executes an HTTP request with exponential backoff and jitter.
   */
  public static async fetchWithRetry(
    url: string,
    options: ScrapeRequestOptions = {}
  ): Promise<{ status: number; text: string; json?: unknown }> {
    const {
      headers = {},
      method = "GET",
      body,
      maxRetries = 3,
      initialDelayMs = 1000,
      useProxyIfAvailable = true,
    } = options;

    // Check if Firecrawl API Key is available for hard-to-scrape portals
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (useProxyIfAvailable && firecrawlKey && !firecrawlKey.includes("your-")) {
      try {
        const firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["html", "markdown"],
            waitFor: 2000,
          }),
        });

        if (firecrawlRes.ok) {
          const data = await firecrawlRes.json();
          const content = data.data?.html || data.data?.markdown || "";
          return { status: 200, text: content };
        }
      } catch (proxyErr) {
        console.warn("[ProxyClient] Firecrawl fallback to direct fetch:", proxyErr);
      }
    }

    // Direct fetch with exponential backoff
    let delay = initialDelayMs;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const requestHeaders: Record<string, string> = {
          "User-Agent": this.getRandomUserAgent(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
          "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
          "Cache-Control": "no-cache",
          ...headers,
        };

        const res = await fetch(url, {
          method,
          headers: requestHeaders,
          body,
        });

        if (res.status === 429 || res.status === 503) {
          // Rate limited or temporary upstream server error, back off and retry
          console.warn(`[ProxyClient] Rate limited (${res.status}) on ${url}. Attempt ${attempt}/${maxRetries}. Retrying in ${delay}ms...`);
          await this.sleep(delay + Math.random() * 500);
          delay *= 2;
          continue;
        }

        const text = await res.text();
        let json: unknown;
        try {
          json = JSON.parse(text);
        } catch {
          // Response is HTML or plain text
        }

        return { status: res.status, text, json };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[ProxyClient] Fetch attempt ${attempt} failed for ${url}:`, lastError.message);
        if (attempt < maxRetries) {
          await this.sleep(delay + Math.random() * 500);
          delay *= 2;
        }
      }
    }

    throw new Error(
      `Failed to fetch ${url} after ${maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`
    );
  }
}
