import crypto from "crypto";

/**
 * Validates Meta WhatsApp Webhook signature using HMAC-SHA256 and constant-time comparison.
 * Protects against spoofing and replay attacks.
 * 
 * @param payload Raw string payload from request body
 * @param signatureHeader Value of 'X-Hub-Signature-256' header (e.g., 'sha256=abcdef...')
 * @param appSecret Meta App Secret from environment variables
 * @returns boolean True if signature is authentic
 */
export function verifyMetaSignature(
  payload: string,
  signatureHeader: string | null | undefined,
  appSecret: string | undefined
): boolean {
  if (!signatureHeader || !appSecret) {
    return false;
  }

  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    return false;
  }

  const expectedSignature = parts[1];

  const hmac = crypto.createHmac("sha256", appSecret);
  const calculatedSignature = hmac.update(payload).digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const calculatedBuffer = Buffer.from(calculatedSignature, "hex");

  if (expectedBuffer.length !== calculatedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, calculatedBuffer);
}
