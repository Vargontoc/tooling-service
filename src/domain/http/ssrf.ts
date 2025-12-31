import { isIP } from "node:net";
import { URL } from "node:url";

function isPrivateIPv4(ip: string): boolean {

  const [a, b = 0] = ip.split(".").map((x) => Number(x));
  if ([a, b].some((n) => Number.isNaN(n))) return false;

  if (a === 10) return true;

  if (a === 127) return true;

  if (a === 0) return true;
  if (a === 169 && b === 254) return true;

  if (a === 172 && b >= 16 && b <= 31) return true;

  if (a === 192 && b === 168) return true;

  return false;
}

export function validateTargetUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http/https protocols are allowed.");
  }

  if (!url.hostname) {
    throw new Error("URL hostname is required.");
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname === "0.0.0.0") {
    throw new Error("Target host is not allowed.");
  }

  if (isIP(hostname) === 4) {
    if (isPrivateIPv4(hostname)) {
      throw new Error("Target IP is not allowed.");
    }
  }

  return url;
}
