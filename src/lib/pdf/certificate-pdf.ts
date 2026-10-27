import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface CompetitionCertificatePdfData {
  certificateId: string;
  verificationCode: string;
  verificationUrl: string;
  athleteName: string;
  division: string;
  weightClass: string;
  gender: string;
  equipment: string;
  meetTitle: string;
  meetLocation: string;
  meetDate: string;
  bestSquat: number;
  bestBench: number;
  bestDeadlift: number;
  total: number;
  ipfGlPoints: number;
  rank: number | null;
  medal: "GOLD" | "SILVER" | "BRONZE" | "PARTICIPATION";
  medalText: string;
  issueDate: string;
  securityHash: string;
  shortHash: string;
  federationName?: string;
  presidentName?: string;
  secretaryName?: string;
}

/**
 * Generates an official high-resolution, vector-crisp Competition Certificate PDF (Buffer)
 * International Standard A4 Landscape: 842 x 595 points
 */
export async function generateCompetitionCertificatePdf(
  data: CompetitionCertificatePdfData
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // A4 Landscape dimensions
  const width = 842;
  const height = 595;
  const page = pdfDoc.addPage([width, height]);

  // Load fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Generate QR Code PNG Buffer
  const qrBuffer = await QRCode.toBuffer(data.verificationUrl, {
    width: 240,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  const qrImage = await pdfDoc.embedPng(qrBuffer);

  // Colors
  const bgDark = rgb(0.04, 0.04, 0.05);
  const bgSurface = rgb(0.08, 0.08, 0.10);
  const gold = rgb(0.96, 0.62, 0.07); // #F59E0B
  const goldLight = rgb(0.99, 0.85, 0.55);
  const primaryOrange = rgb(1.0, 0.27, 0.0); // #FF4500
  const textWhite = rgb(1, 1, 1);
  const textGray = rgb(0.70, 0.70, 0.75);
  const borderGold = rgb(0.85, 0.55, 0.10);

  // 1. Certificate Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bgDark,
  });

  // 2. Ornate Multi-Layer Border
  // Outer Border
  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: borderGold,
    borderWidth: 3,
    color: bgSurface,
  });

  // Inner Fine Border
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: gold,
    borderWidth: 1,
  });

  // Corner Rosette Accents
  const cornerSize = 24;
  // Bottom-Left
  page.drawLine({ start: { x: 25, y: 25 + cornerSize }, end: { x: 25 + cornerSize, y: 25 }, thickness: 2, color: gold });
  // Top-Left
  page.drawLine({ start: { x: 25, y: height - 25 - cornerSize }, end: { x: 25 + cornerSize, y: height - 25 }, thickness: 2, color: gold });
  // Bottom-Right
  page.drawLine({ start: { x: width - 25 - cornerSize, y: 25 }, end: { x: width - 25, y: 25 + cornerSize }, thickness: 2, color: gold });
  // Top-Right
  page.drawLine({ start: { x: width - 25 - cornerSize, y: height - 25 }, end: { x: width - 25, y: height - 25 - cornerSize }, thickness: 2, color: gold });

  // 3. Federation Emblem & Title Header
  const fedName = (data.federationName || "INDIAN POWERLIFTING FEDERATION").toUpperCase();
  page.drawText(fedName, {
    x: width / 2 - (fontBold.widthOfTextAtSize(fedName, 18) / 2),
    y: height - 68,
    size: 18,
    font: fontBold,
    color: goldLight,
  });

  const fedSub = "RECOGNIZED NATIONAL GOVERNING BODY • AFFILIATED TO INTERNATIONAL POWERLIFTING FEDERATION";
  page.drawText(fedSub, {
    x: width / 2 - (fontRegular.widthOfTextAtSize(fedSub, 8) / 2),
    y: height - 84,
    size: 8,
    font: fontRegular,
    color: textGray,
  });

  // Center Gold Bar
  page.drawLine({
    start: { x: width / 2 - 180, y: height - 94 },
    end: { x: width / 2 + 180, y: height - 94 },
    thickness: 1.5,
    color: primaryOrange,
  });

  // 4. Main Certificate Title
  const isMedal = data.medal === "GOLD" || data.medal === "SILVER" || data.medal === "BRONZE";
  const mainTitle = isMedal ? "CERTIFICATE OF MERIT & PODIUM EXCELLENCE" : "OFFICIAL CERTIFICATE OF PARTICIPATION";
  page.drawText(mainTitle, {
    x: width / 2 - (fontBold.widthOfTextAtSize(mainTitle, 14) / 2),
    y: height - 120,
    size: 14,
    font: fontBold,
    color: gold,
  });

  // Subtitle
  const conferText = "THIS IS PROUDLY CONFERRED UPON";
  page.drawText(conferText, {
    x: width / 2 - (fontTimes.widthOfTextAtSize(conferText, 11) / 2),
    y: height - 146,
    size: 11,
    font: fontTimes,
    color: textGray,
  });

  // 5. Athlete Name (Prominent & Elegant)
  const athleteName = data.athleteName.toUpperCase();
  const nameSize = athleteName.length > 22 ? 24 : 28;
  page.drawText(athleteName, {
    x: width / 2 - (fontTimesBold.widthOfTextAtSize(athleteName, nameSize) / 2),
    y: height - 182,
    size: nameSize,
    font: fontTimesBold,
    color: textWhite,
  });

  // Decorative Underline under Athlete Name
  page.drawLine({
    start: { x: width / 2 - 160, y: height - 192 },
    end: { x: width / 2 + 160, y: height - 192 },
    thickness: 1,
    color: gold,
  });

  // 6. Placement & Achievement Declaration
  const achievementText = `for outstanding performance and securing ${data.medalText}`;
  page.drawText(achievementText, {
    x: width / 2 - (fontBold.widthOfTextAtSize(achievementText, 11) / 2),
    y: height - 215,
    size: 11,
    font: fontBold,
    color: isMedal ? goldLight : textWhite,
  });

  // Event & Category Details
  const divisionCategory = `in the ${data.division} • ${data.weightClass} Class (${data.gender}) • ${data.equipment}`;
  page.drawText(divisionCategory, {
    x: width / 2 - (fontRegular.widthOfTextAtSize(divisionCategory, 10.5) / 2),
    y: height - 233,
    size: 10.5,
    font: fontRegular,
    color: textGray,
  });

  const meetLine = `at the ${data.meetTitle.toUpperCase()}, held at ${data.meetLocation} on ${data.meetDate}.`;
  page.drawText(meetLine, {
    x: width / 2 - (fontRegular.widthOfTextAtSize(meetLine, 10) / 2),
    y: height - 251,
    size: 10,
    font: fontRegular,
    color: textWhite,
  });

  // 7. Official Results Grid (Lifts Breakdown)
  const gridWidth = 560;
  const gridX = width / 2 - (gridWidth / 2);
  const gridY = height - 340;
  const gridHeight = 65;

  page.drawRectangle({
    x: gridX,
    y: gridY,
    width: gridWidth,
    height: gridHeight,
    color: rgb(0.11, 0.11, 0.15),
    borderColor: gold,
    borderWidth: 1.5,
  });

  // Col dividers (5 columns: Squat, Bench, Deadlift, Total, IPF GL Points)
  const colW = gridWidth / 5;
  for (let i = 1; i < 5; i++) {
    page.drawLine({
      start: { x: gridX + i * colW, y: gridY },
      end: { x: gridX + i * colW, y: gridY + gridHeight },
      thickness: 1,
      color: rgb(0.25, 0.25, 0.30),
    });
  }

  // Column Labels
  const labels = ["BEST SQUAT", "BEST BENCH", "BEST DEADLIFT", "TOTAL", "IPF GL POINTS"];
  labels.forEach((label, idx) => {
    const lx = gridX + idx * colW + colW / 2;
    page.drawText(label, {
      x: lx - (fontRegular.widthOfTextAtSize(label, 7.5) / 2),
      y: gridY + 44,
      size: 7.5,
      font: fontRegular,
      color: textGray,
    });
  });

  // Column Values
  const values = [
    `${data.bestSquat} KG`,
    `${data.bestBench} KG`,
    `${data.bestDeadlift} KG`,
    `${data.total} KG`,
    data.ipfGlPoints.toFixed(2),
  ];
  values.forEach((val, idx) => {
    const vx = gridX + idx * colW + colW / 2;
    page.drawText(val, {
      x: vx - (fontBold.widthOfTextAtSize(val, 13) / 2),
      y: gridY + 16,
      size: 13,
      font: fontBold,
      color: idx >= 3 ? goldLight : textWhite,
    });
  });

  // 8. Signatures & Official Ratified Seal Section
  const signY = 110;

  // President
  const presName = (data.presidentName || "Akash & Tanvi").toUpperCase();
  page.drawLine({ start: { x: 90, y: signY + 30 }, end: { x: 230, y: signY + 30 }, thickness: 1, color: gold });
  page.drawText(presName, { x: 160 - (fontBold.widthOfTextAtSize(presName, 9.5) / 2), y: signY + 16, size: 9.5, font: fontBold, color: textWhite });
  page.drawText("PRESIDENT / CHIEF CONVENER", { x: 160 - (fontRegular.widthOfTextAtSize("PRESIDENT / CHIEF CONVENER", 7.5) / 2), y: signY + 4, size: 7.5, font: fontRegular, color: textGray });

  // Center Official Seal & Ribbon
  const sealX = width / 2;
  page.drawCircle({ x: sealX, y: signY + 22, size: 30, color: rgb(0.12, 0.12, 0.16), borderColor: gold, borderWidth: 2 });
  page.drawCircle({ x: sealX, y: signY + 22, size: 24, borderColor: primaryOrange, borderWidth: 1 });
  page.drawText("IPF RATIFIED", { x: sealX - (fontBold.widthOfTextAtSize("IPF RATIFIED", 6.5) / 2), y: signY + 24, size: 6.5, font: fontBold, color: gold });
  page.drawText("OFFICIAL SEAL", { x: sealX - (fontRegular.widthOfTextAtSize("OFFICIAL SEAL", 5.5) / 2), y: signY + 14, size: 5.5, font: fontRegular, color: textWhite });

  // General Secretary
  const secName = (data.secretaryName || "General Secretary").toUpperCase();
  page.drawLine({ start: { x: width - 230, y: signY + 30 }, end: { x: width - 90, y: signY + 30 }, thickness: 1, color: gold });
  page.drawText(secName, { x: width - 160 - (fontBold.widthOfTextAtSize(secName, 9.5) / 2), y: signY + 16, size: 9.5, font: fontBold, color: textWhite });
  page.drawText("GENERAL SECRETARY / TECHNICAL DELEGATE", { x: width - 160 - (fontRegular.widthOfTextAtSize("GENERAL SECRETARY / TECHNICAL DELEGATE", 7.5) / 2), y: signY + 4, size: 7.5, font: fontRegular, color: textGray });

  // 9. QR Code & Cryptographic Verification Footprint
  const qrSize = 56;
  const qrX = 42;
  const qrY = 38;

  // White background for QR code
  page.drawRectangle({
    x: qrX - 3,
    y: qrY - 3,
    width: qrSize + 6,
    height: qrSize + 6,
    color: rgb(1, 1, 1),
    borderColor: gold,
    borderWidth: 1,
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // Verification Details Text (Next to QR)
  const metaX = qrX + qrSize + 14;
  page.drawText(`VERIFICATION CODE: ${data.verificationCode}`, { x: metaX, y: qrY + 42, size: 8, font: fontMono, color: gold });
  page.drawText(`CRYPTOGRAPHIC SECURITY HASH: ${data.shortHash} (HMAC-SHA256)`, { x: metaX, y: qrY + 30, size: 7.5, font: fontMono, color: textWhite });
  page.drawText(`ISSUE DATE: ${data.issueDate} • PUBLIC VERIFICATION: ${data.verificationUrl}`, { x: metaX, y: qrY + 18, size: 7, font: fontRegular, color: textGray });
  page.drawText(`SHA-256: ${data.securityHash.substring(0, 48)}...`, { x: metaX, y: qrY + 6, size: 6, font: fontMono, color: rgb(0.5, 0.5, 0.55) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
