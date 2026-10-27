import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface IdCardPdfData {
  cardNumber: string;
  athleteName: string;
  email: string | null;
  gender: string;
  weightClass: string;
  clubState: string;
  planType: string;
  role: string;
  startDate: string;
  endDate: string;
  verificationUrl: string;
  securityHash: string;
  shortHash: string;
  tenantOrganizationName?: string;
  presidentName?: string;
  secretaryName?: string;
}

/**
 * Generates an official high-resolution, vector-crisp Athlete Digital ID Card Pass (PDF Buffer)
 * Standard High-Res Event Credential (Badge Dimensions: 450 x 680 pt)
 */
export async function generateAthleteIdCardPdf(data: IdCardPdfData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // High-Resolution Event Lanyard Pass Dimensions (450 x 680 pt)
  const width = 450;
  const height = 680;
  const page = pdfDoc.addPage([width, height]);

  // Load standard Helvetica fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
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
  const bgDark = rgb(0.05, 0.05, 0.07);
  const bgCard = rgb(0.09, 0.09, 0.12);
  const primaryOrange = rgb(1.0, 0.27, 0.0); // #FF4500
  const gold = rgb(0.96, 0.62, 0.07); // #F59E0B
  const textWhite = rgb(1, 1, 1);
  const textGray = rgb(0.65, 0.65, 0.70);
  const borderGray = rgb(0.2, 0.2, 0.25);
  const successGreen = rgb(0.13, 0.77, 0.36);

  // 1. Background Fill
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bgDark,
  });

  // 2. Outer Ornate Border with Gold / Orange Accents
  page.drawRectangle({
    x: 15,
    y: 15,
    width: width - 30,
    height: height - 30,
    borderColor: primaryOrange,
    borderWidth: 2,
    color: bgCard,
  });

  // Inner border guideline
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // 3. Top Lanyard Punch Slot Guide
  page.drawCircle({
    x: width / 2,
    y: height - 35,
    size: 6,
    color: bgDark,
    borderColor: gold,
    borderWidth: 1.5,
  });

  // 4. Header Section: Organization Name & Emblem
  const orgName = (data.tenantOrganizationName || "INDIAN POWERLIFTING FEDERATION").toUpperCase();
  page.drawText(orgName, {
    x: width / 2 - (fontBold.widthOfTextAtSize(orgName, 13) / 2),
    y: height - 70,
    size: 13,
    font: fontBold,
    color: gold,
  });

  const subHeader = "OFFICIAL ATHLETE COMPETITION PASS • RATIFIED";
  page.drawText(subHeader, {
    x: width / 2 - (fontRegular.widthOfTextAtSize(subHeader, 8.5) / 2),
    y: height - 86,
    size: 8.5,
    font: fontRegular,
    color: textGray,
  });

  // Decorative Horizontal Stripe
  page.drawLine({
    start: { x: 35, y: height - 96 },
    end: { x: width - 35, y: height - 96 },
    thickness: 1.5,
    color: primaryOrange,
  });

  // 5. Athlete Profile Silhouette / Photo Avatar Box
  const avatarBoxY = height - 230;
  page.drawRectangle({
    x: width / 2 - 55,
    y: avatarBoxY,
    width: 110,
    height: 110,
    color: rgb(0.13, 0.13, 0.18),
    borderColor: gold,
    borderWidth: 2,
  });

  // Silhouette / Barbell Crest Icon
  page.drawRectangle({
    x: width / 2 - 40,
    y: avatarBoxY + 52,
    width: 80,
    height: 6,
    color: textWhite,
  });
  page.drawRectangle({
    x: width / 2 - 32,
    y: avatarBoxY + 40,
    width: 8,
    height: 30,
    color: gold,
  });
  page.drawRectangle({
    x: width / 2 + 24,
    y: avatarBoxY + 40,
    width: 8,
    height: 30,
    color: gold,
  });
  page.drawCircle({
    x: width / 2,
    y: avatarBoxY + 55,
    size: 10,
    color: primaryOrange,
  });

  // Active Verified Badge Pill
  const pillText = "✓ ACTIVE COMPETITOR";
  page.drawRectangle({
    x: width / 2 - 70,
    y: avatarBoxY - 14,
    width: 140,
    height: 20,
    color: successGreen,
  });
  page.drawText(pillText, {
    x: width / 2 - (fontBold.widthOfTextAtSize(pillText, 9) / 2),
    y: avatarBoxY - 9,
    size: 9,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 6. Athlete Name
  const athleteName = data.athleteName.toUpperCase();
  const nameSize = athleteName.length > 20 ? 16 : 19;
  page.drawText(athleteName, {
    x: width / 2 - (fontBold.widthOfTextAtSize(athleteName, nameSize) / 2),
    y: avatarBoxY - 42,
    size: nameSize,
    font: fontBold,
    color: textWhite,
  });

  // Federation Card Number (Monospace, bold gold)
  const cardNum = data.cardNumber;
  page.drawText(cardNum, {
    x: width / 2 - (fontMono.widthOfTextAtSize(cardNum, 14) / 2),
    y: avatarBoxY - 62,
    size: 14,
    font: fontMono,
    color: gold,
  });

  // 7. Grid Details (Weight Class, Division, Club/State, Validity)
  const gridY = avatarBoxY - 90;
  
  // Left Column: Weight Class & Gender
  page.drawText("WEIGHT CLASS", { x: 45, y: gridY, size: 7.5, font: fontRegular, color: textGray });
  page.drawText(`${data.weightClass} (${data.gender})`, { x: 45, y: gridY - 14, size: 10.5, font: fontBold, color: textWhite });

  // Right Column: State / Club
  page.drawText("AFFILIATED STATE / CLUB", { x: 230, y: gridY, size: 7.5, font: fontRegular, color: textGray });
  const stateText = data.clubState.length > 24 ? data.clubState.substring(0, 24) + "..." : data.clubState;
  page.drawText(stateText, { x: 230, y: gridY - 14, size: 10.5, font: fontBold, color: textWhite });

  // Row 2: Plan Type & Validity
  page.drawText("MEMBERSHIP TIER", { x: 45, y: gridY - 38, size: 7.5, font: fontRegular, color: textGray });
  page.drawText(data.planType.toUpperCase(), { x: 45, y: gridY - 52, size: 10, font: fontBold, color: textWhite });

  page.drawText("VALID THRU", { x: 230, y: gridY - 38, size: 7.5, font: fontRegular, color: textGray });
  page.drawText(data.endDate, { x: 230, y: gridY - 52, size: 10.5, font: fontBold, color: gold });

  // Divider
  page.drawLine({
    start: { x: 40, y: gridY - 65 },
    end: { x: width - 40, y: gridY - 65 },
    thickness: 1,
    color: borderGray,
  });

  // 8. High-Res QR Code Verification Block
  const qrSize = 100;
  const qrX = width / 2 - (qrSize / 2);
  const qrY = 110;

  // White backing for QR code
  page.drawRectangle({
    x: qrX - 6,
    y: qrY - 6,
    width: qrSize + 12,
    height: qrSize + 12,
    color: rgb(1, 1, 1),
    borderColor: primaryOrange,
    borderWidth: 1.5,
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // Scan instruction
  const scanText = "SCAN TO VERIFY WEIGH-IN CLEARANCE & LOR";
  page.drawText(scanText, {
    x: width / 2 - (fontBold.widthOfTextAtSize(scanText, 7.5) / 2),
    y: qrY - 16,
    size: 7.5,
    font: fontBold,
    color: textWhite,
  });

  // 9. Tamper-Proof Cryptographic Footprint (Anti-Counterfeit)
  const hashLabel = `DIGITAL SECURITY HASH: ${data.shortHash}`;
  page.drawText(hashLabel, {
    x: width / 2 - (fontMono.widthOfTextAtSize(hashLabel, 7.5) / 2),
    y: 65,
    size: 7.5,
    font: fontMono,
    color: gold,
  });

  const fullHashSnippet = `SHA-256: ${data.securityHash.substring(0, 36)}...`;
  page.drawText(fullHashSnippet, {
    x: width / 2 - (fontMono.widthOfTextAtSize(fullHashSnippet, 6) / 2),
    y: 52,
    size: 6,
    font: fontMono,
    color: textGray,
  });

  // Bottom Guilloche Security Stripe
  const bottomStripe = "★ OFFICIAL RATIFIED IDENTITY DOCUMENT ★ INDIAN POWERLIFTING FEDERATION ★";
  page.drawText(bottomStripe, {
    x: width / 2 - (fontRegular.widthOfTextAtSize(bottomStripe, 6.5) / 2),
    y: 32,
    size: 6.5,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
