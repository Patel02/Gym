/**
 * High-Resolution Vector Digital Badge Generator
 * Produces official SVG badges for embedding in athlete emails, social sharing, and dashboard profiles
 */

export interface AthleteBadgeProps {
  athleteName: string;
  cardNumber: string;
  weightClass: string;
  gender: string;
  clubState: string;
  shortHash: string;
  validThru: string;
}

export interface PodiumBadgeProps {
  athleteName: string;
  medal: "GOLD" | "SILVER" | "BRONZE" | "PARTICIPATION";
  rank: number | null;
  meetTitle: string;
  total: number;
  ipfGlPoints: number;
  shortHash: string;
  year: string;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

/**
 * Generate official Athlete Identity Digital Badge (SVG)
 */
export function generateAthleteBadgeSvg(props: AthleteBadgeProps): string {
  const name = escapeXml(props.athleteName.toUpperCase());
  const card = escapeXml(props.cardNumber);
  const state = escapeXml(props.clubState.toUpperCase());
  const hash = escapeXml(props.shortHash);
  const valid = escapeXml(props.validThru);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="50%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffedd5"/>
      <stop offset="35%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="orangeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff4500"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#f59e0b" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Outer Protective Halo -->
  <polygon points="250,20 460,95 460,320 250,470 40,320 40,95" 
           fill="none" stroke="url(#goldAccent)" stroke-width="4" filter="url(#badgeShadow)"/>
  
  <!-- Main Shield Body -->
  <polygon points="250,30 445,102 445,312 250,455 55,312 55,102" 
           fill="url(#shieldBg)" stroke="#27272a" stroke-width="2"/>

  <!-- Inner Concentric Ring -->
  <polygon points="250,44 430,110 430,302 250,438 70,302 70,110" 
           fill="none" stroke="url(#orangeGlow)" stroke-width="1.5" stroke-dasharray="6,4"/>

  <!-- Federation Header -->
  <text x="250" y="85" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="url(#goldAccent)" letter-spacing="3">
    INDIAN POWERLIFTING FEDERATION
  </text>
  <text x="250" y="105" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="11" fill="#a1a1aa" letter-spacing="2">
    AFFILIATED STATE MEMBER • RATIFIED
  </text>

  <!-- Central Crest Emblem -->
  <circle cx="250" cy="180" r="54" fill="#18181b" stroke="url(#goldAccent)" stroke-width="3"/>
  <circle cx="250" cy="180" r="46" fill="none" stroke="#ff4500" stroke-width="1.5"/>

  <!-- Barbell Graphic -->
  <rect x="210" y="177" width="80" height="6" rx="3" fill="#ffffff"/>
  <rect x="222" y="163" width="8" height="34" rx="2" fill="url(#goldAccent)"/>
  <rect x="214" y="167" width="6" height="26" rx="1.5" fill="#f97316"/>
  <rect x="270" y="163" width="8" height="34" rx="2" fill="url(#goldAccent)"/>
  <rect x="280" y="167" width="6" height="26" rx="1.5" fill="#f97316"/>
  <circle cx="250" cy="180" r="8" fill="#ff4500"/>

  <!-- Verified Status Banner -->
  <g transform="translate(150, 246)">
    <rect x="0" y="0" width="200" height="28" rx="14" fill="#166534" stroke="#22c55e" stroke-width="1.5"/>
    <text x="100" y="19" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="12" fill="#ffffff" letter-spacing="2">
      ACTIVE COMPETITOR
    </text>
  </g>

  <!-- Athlete Credentials -->
  <text x="250" y="306" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="20" fill="#ffffff" letter-spacing="1">
    ${name}
  </text>
  <text x="250" y="328" text-anchor="middle" font-family="monospace" font-weight="700" font-size="15" fill="#f59e0b" letter-spacing="2">
    ${card}
  </text>
  
  <text x="250" y="352" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="12" fill="#d4d4d8">
    ${props.weightClass} • ${props.gender}
  </text>
  <text x="250" y="372" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="11" fill="#71717a">
    ${state}
  </text>

  <!-- Cryptographic Security Seal -->
  <line x1="120" y1="392" x2="380" y2="392" stroke="#27272a" stroke-width="1"/>
  <text x="250" y="412" text-anchor="middle" font-family="monospace" font-weight="700" font-size="11" fill="#f59e0b" letter-spacing="1.5">
    HASH: ${hash}
  </text>
  <text x="250" y="428" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="10" fill="#71717a">
    VALID THRU: ${valid} • CRYPTOGRAPHICALLY RATIFIED
  </text>
</svg>`;
}

/**
 * Generate official Competition Podium Medal Digital Badge (SVG)
 */
export function generatePodiumBadgeSvg(props: PodiumBadgeProps): string {
  const name = escapeXml(props.athleteName.toUpperCase());
  const meet = escapeXml(props.meetTitle.toUpperCase());
  const hash = escapeXml(props.shortHash);
  const year = escapeXml(props.year);

  let medalTitle = "NATIONAL GOLD MEDALIST";
  let placeText = "1ST PLACE";
  let primaryColor1 = "#fef08a";
  let primaryColor2 = "#eab308";
  let primaryColor3 = "#a16207";
  let ribbonColor = "#b91c1c";

  if (props.medal === "SILVER") {
    medalTitle = "NATIONAL SILVER MEDALIST";
    placeText = "2ND PLACE";
    primaryColor1 = "#f4f4f5";
    primaryColor2 = "#a1a1aa";
    primaryColor3 = "#52525b";
    ribbonColor = "#1e3a8a";
  } else if (props.medal === "BRONZE") {
    medalTitle = "NATIONAL BRONZE MEDALIST";
    placeText = "3RD PLACE";
    primaryColor1 = "#fed7aa";
    primaryColor2 = "#ea580c";
    primaryColor3 = "#9a3412";
    ribbonColor = "#065f46";
  } else if (props.medal === "PARTICIPATION") {
    medalTitle = props.rank ? `TOP RANK (#${props.rank})` : "OFFICIAL MERIT FINISHER";
    placeText = props.rank ? `#${props.rank} OVERALL` : "MERIT OF HONOUR";
    primaryColor1 = "#e0e7ff";
    primaryColor2 = "#6366f1";
    primaryColor3 = "#3730a3";
    ribbonColor = "#312e81";
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="podiumBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141416"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="medalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor1}"/>
      <stop offset="50%" stop-color="${primaryColor2}"/>
      <stop offset="100%" stop-color="${primaryColor3}"/>
    </linearGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="${primaryColor2}" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Medal Ribbon V-Hanger -->
  <polygon points="190,0 250,70 170,120 150,0" fill="${ribbonColor}" opacity="0.9"/>
  <polygon points="310,0 250,70 330,120 350,0" fill="${ribbonColor}" opacity="0.9"/>
  <polygon points="250,55 220,110 280,110" fill="#f59e0b"/>

  <!-- Outer Starburst Rosette / Medal Rim -->
  <circle cx="250" cy="260" r="200" fill="url(#podiumBg)" stroke="url(#medalGrad)" stroke-width="6" filter="url(#goldGlow)"/>
  <circle cx="250" cy="260" r="186" fill="none" stroke="#27272a" stroke-width="2"/>
  <circle cx="250" cy="260" r="180" fill="none" stroke="url(#medalGrad)" stroke-width="2" stroke-dasharray="8,6"/>

  <!-- Header -->
  <text x="250" y="125" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="13" fill="url(#medalGrad)" letter-spacing="3">
    IPF NATIONAL CHAMPIONSHIP
  </text>
  
  <!-- Placement Banner -->
  <rect x="140" y="142" width="220" height="34" rx="17" fill="url(#medalGrad)"/>
  <text x="250" y="165" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="15" fill="#000000" letter-spacing="2">
    ${placeText}
  </text>

  <!-- Athlete Name -->
  <text x="250" y="215" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="22" fill="#ffffff" letter-spacing="1">
    ${name}
  </text>

  <!-- Medal Title -->
  <text x="250" y="240" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="14" fill="url(#medalGrad)" letter-spacing="1.5">
    ${medalTitle}
  </text>

  <!-- Meet Title -->
  <text x="250" y="265" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="12" fill="#d4d4d8">
    ${meet}
  </text>

  <!-- Stats Grid -->
  <g transform="translate(100, 285)">
    <!-- Total KG -->
    <rect x="0" y="0" width="140" height="50" rx="8" fill="#18181b" stroke="#27272a"/>
    <text x="70" y="20" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#a1a1aa">OFFICIAL TOTAL</text>
    <text x="70" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="18" fill="#ffffff">${props.total} KG</text>
    
    <!-- IPF GL Points -->
    <rect x="160" y="0" width="140" height="50" rx="8" fill="#18181b" stroke="#27272a"/>
    <text x="230" y="20" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#a1a1aa">IPF GL POINTS</text>
    <text x="230" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="18" fill="url(#medalGrad)">${props.ipfGlPoints.toFixed(2)}</text>
  </g>

  <!-- Bottom Verification Footprint -->
  <line x1="120" y1="365" x2="380" y2="365" stroke="#27272a" stroke-width="1"/>
  <text x="250" y="390" text-anchor="middle" font-family="monospace" font-weight="700" font-size="12" fill="url(#medalGrad)" letter-spacing="2">
    SECURITY HASH: ${hash}
  </text>
  <text x="250" y="410" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="10" fill="#71717a">
    SEASON ${year} • CRYPTOGRAPHICALLY RATIFIED ON-CHAIN
  </text>
</svg>`;
}
