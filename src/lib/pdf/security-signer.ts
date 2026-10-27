import crypto from "crypto";

export interface SecuritySignatureResult {
  fullHash: string;
  shortHash: string;
  tamperProofCode: string;
  issuedAt: string;
}

function getFederationSigningSalt() {
  const signingSalt = process.env.AUTH_SECRET;
  if (!signingSalt) {
    throw new Error("AUTH_SECRET must be configured to sign federation credentials.");
  }
  return signingSalt;
}

/**
 * Generate cryptographic SHA-256 anti-forgery digital signature
 * Verifies authenticity of Athlete ID cards and Competition Certificates
 */
export function generateSecuritySignature(data: {
  id: string;
  type: "ID_CARD" | "CERTIFICATE";
  userId: string;
  code: string;
  metadata?: string | number;
}): SecuritySignatureResult {
  const issuedAt = new Date().toISOString();
  const canonicalPayload = [
    `TYPE:${data.type}`,
    `ID:${data.id}`,
    `USER:${data.userId}`,
    `CODE:${data.code}`,
    `META:${data.metadata ?? "RATIFIED"}`,
    `SALT:${getFederationSigningSalt()}`,
  ].join("|");

  const fullHash = crypto
    .createHash("sha256")
    .update(canonicalPayload)
    .digest("hex");

  // Short human-readable 12-char fingerprint e.g. WPI-8F2B-9A10
  const shortHash = `WPI-${fullHash.substring(0, 4).toUpperCase()}-${fullHash.substring(4, 8).toUpperCase()}`;

  // Encoded cryptographic stamp
  const stampPayload = JSON.stringify({
    c: data.code,
    u: data.userId.substring(0, 8),
    t: data.type,
    h: fullHash.substring(0, 16),
    d: issuedAt.split("T")[0],
  });

  const tamperProofCode = Buffer.from(stampPayload).toString("base64url");

  return {
    fullHash,
    shortHash,
    tamperProofCode,
    issuedAt,
  };
}

/**
 * Verifies whether a given verification payload matches the cryptographic hash
 */
export function verifySecuritySignature(
  data: {
    id: string;
    type: "ID_CARD" | "CERTIFICATE";
    userId: string;
    code: string;
    metadata?: string | number;
  },
  signatureToVerify: string
): boolean {
  const { fullHash } = generateSecuritySignature(data);
  return fullHash.toLowerCase() === signatureToVerify.toLowerCase();
}
