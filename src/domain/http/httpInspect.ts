import { request } from "undici";
import { validateTargetUrl } from "./ssrf.js";


export type HttpInspectInput = {
  url: string;
  method: "GET" | "HEAD";
  timeoutMs: number;
  followRedirects: boolean;
};

export type HttpInspectResult = {
  url: string;
  finalUrl: string;
  method: "GET" | "HEAD";
  status: number;
  durationMs: number;
  headers: Record<string, string>;
};

const ALLOWED_RESPONSE_HEADERS = new Set([
  "content-type",
  "content-length",
  "cache-control",
  "etag",
  "last-modified",
  "server",
  "date",
  "location",
]);

function pickHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    if (!ALLOWED_RESPONSE_HEADERS.has(key)) continue;
    if (typeof v === "string") out[key] = v;
    else if (Array.isArray(v)) out[key] = v.join(", ");
  }
  return out;
}

export async function httpInspect(input: HttpInspectInput): Promise<HttpInspectResult> {
  const url = validateTargetUrl(input.url);

  const start = Date.now();

  const opts: any = {
    method: input.method,
    headersTimeout: input.timeoutMs,
    bodyTimeout: input.timeoutMs,
  };

  if (input.followRedirects) {
    opts.maxRedirections = 3;
  } else {
    opts.maxRedirections = 0;
  }

  const res = await request(url, opts);

  // Consumimos body solo si GET para liberar socket; pero limitamos bytes.
  if (input.method === "GET") {
    // Leemos un máximo de 64KB (suficiente para liberar, sin descargar "todo")
    const maxBytes = 64 * 1024;
    let read = 0;
    for await (const chunk of res.body) {
      read += Buffer.byteLength(chunk);
      if (read >= maxBytes) break;
    }
  } else {
    // HEAD: drenar por seguridad
    res.body?.resume();
  }

  const durationMs = Date.now() - start;

  const history = (res as any).context?.history;
  const finalUrl = (history?.length ?? 0) > 0
    ? String(history[history.length - 1])
    : url.toString();

  return {
    url: url.toString(),
    finalUrl,
    method: input.method,
    status: res.statusCode,
    durationMs,
    headers: pickHeaders(res.headers as any),
  };
}
