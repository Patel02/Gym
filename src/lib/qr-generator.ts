import QRCode from "qrcode";

const qrCache = new Map<string, string>();

export async function generateQrDataUrl(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  const cacheKey = `${text}:${options?.width || 320}`;
  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey)!;
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: options?.width || 320,
      color: {
        dark: options?.color?.dark || "#000000",
        light: options?.color?.light || "#ffffff",
      },
      ...options,
    });
    qrCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (error) {
    console.error("Failed to generate QR Data URL:", error);
    // Return empty fallback SVG string data URL
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23eee'/></svg>";
  }
}

export async function generateQrSvg(text: string): Promise<string> {
  try {
    const svg = await QRCode.toString(text, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    return svg;
  } catch (error) {
    console.error("Failed to generate QR SVG:", error);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="#eee"/></svg>`;
  }
}
