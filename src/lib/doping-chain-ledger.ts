import crypto from "crypto";

export interface AthleteConsentData {
  witnessedObservation: boolean;
  bottlesChosenByAthlete: boolean;
  barcodesMatched: boolean;
  noTamperingObserved: boolean;
  consentTimestamp: string;
  athleteSignatureDataUrl?: string;
  athleteSignatureHash: string;
}

export interface DcoOfficerData {
  name: string;
  licenseNumber: string;
  dcoSignatureDataUrl?: string;
  dcoSignatureHash: string;
  credentialVerified: boolean;
}

export interface ChaperoneData {
  name: string;
  escortConfirmed: boolean;
  handoverTimestamp: string;
}

export interface SampleSecurityData {
  aSampleBarcode: string;
  bSampleBarcode: string;
  aBottleSealCode: string;
  bBottleSealCode: string;
  sampleVolumeMl: number;
  specificGravity: number;
  samplePh: number;
  temperatureCelsius?: number;
}

export interface DopingLedgerBlock {
  blockHeight: number;
  timestamp: string;
  previousBlockHash: string;
  blockHash: string;
  merkleRoot: string;
  testCode: string;
  meetTitle: string;
  athleteId: string;
  athleteName: string;
  athleteConsent: AthleteConsentData;
  dcoOfficer: DcoOfficerData;
  chaperone: ChaperoneData;
  sampleData: SampleSecurityData;
  declaredSubstances: string;
  labDestination: string;
  auditStatus: "VERIFIED_GENUINE" | "TAMPERED" | "PENDING_LAB" | "SAMPLES_DISPATCHED";
}

/**
 * Computes a standard SHA-256 hash of a string
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Computes the 2-level cryptographic Merkle Root of an array of data components
 */
export function computeMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha256("EMPTY_TREE");
  if (leaves.length === 1) return sha256(leaves[0]);

  let currentLevel = leaves.map((leaf) => sha256(leaf));

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(sha256(currentLevel[i] + currentLevel[i + 1]));
      } else {
        // Odd leaf: hash with itself
        nextLevel.push(sha256(currentLevel[i] + currentLevel[i]));
      }
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

/**
 * Calculates the immutable Block Hash of a Doping Chain Block
 */
export function computeDopingBlockHash(params: {
  blockHeight: number;
  timestamp: string;
  previousBlockHash: string;
  merkleRoot: string;
  testCode: string;
  athleteId: string;
  aSampleBarcode: string;
  bSampleBarcode: string;
  dcoSignatureHash: string;
  athleteSignatureHash: string;
}): string {
  const payload = [
    params.blockHeight.toString(),
    params.timestamp,
    params.previousBlockHash,
    params.merkleRoot,
    params.testCode,
    params.athleteId,
    params.aSampleBarcode,
    params.bSampleBarcode,
    params.dcoSignatureHash,
    params.athleteSignatureHash,
  ].join("|");

  return sha256(payload);
}

/**
 * Verifies the mathematical integrity of the entire blockchain-style ledger
 */
export function verifyLedgerChain(chain: DopingLedgerBlock[]): {
  isValid: boolean;
  corruptedBlockHeight?: number;
  reason?: string;
} {
  if (!chain || chain.length === 0) {
    return { isValid: false, reason: "Ledger is empty" };
  }

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    // 1. Verify Genesis block link
    if (i === 0) {
      if (current.previousBlockHash !== "0000000000000000000000000000000000000000000000000000000000000000") {
        return {
          isValid: false,
          corruptedBlockHeight: current.blockHeight,
          reason: "Genesis block previous hash is invalid",
        };
      }
    } else {
      // 2. Verify previous hash chaining
      const prev = chain[i - 1];
      if (current.previousBlockHash !== prev.blockHash) {
        return {
          isValid: false,
          corruptedBlockHeight: current.blockHeight,
          reason: `Block #${current.blockHeight} previousBlockHash does not match Block #${prev.blockHeight} hash`,
        };
      }
    }

    // 3. Recompute Merkle Root
    const expectedMerkleLeaves = [
      current.testCode,
      current.athleteId,
      current.sampleData.aSampleBarcode,
      current.sampleData.bSampleBarcode,
      current.sampleData.sampleVolumeMl.toString(),
      current.sampleData.specificGravity.toString(),
      current.sampleData.samplePh.toString(),
      current.dcoOfficer.dcoSignatureHash,
      current.athleteConsent.athleteSignatureHash,
    ];
    const recomputedMerkle = computeMerkleRoot(expectedMerkleLeaves);
    if (recomputedMerkle !== current.merkleRoot) {
      return {
        isValid: false,
        corruptedBlockHeight: current.blockHeight,
        reason: `Block #${current.blockHeight} Merkle root mismatch - sample or signature data has been tampered with!`,
      };
    }

    // 4. Recompute Block Hash
    const recomputedHash = computeDopingBlockHash({
      blockHeight: current.blockHeight,
      timestamp: current.timestamp,
      previousBlockHash: current.previousBlockHash,
      merkleRoot: current.merkleRoot,
      testCode: current.testCode,
      athleteId: current.athleteId,
      aSampleBarcode: current.sampleData.aSampleBarcode,
      bSampleBarcode: current.sampleData.bSampleBarcode,
      dcoSignatureHash: current.dcoOfficer.dcoSignatureHash,
      athleteSignatureHash: current.athleteConsent.athleteSignatureHash,
    });

    if (recomputedHash !== current.blockHash) {
      return {
        isValid: false,
        corruptedBlockHeight: current.blockHeight,
        reason: `Block #${current.blockHeight} hash signature is invalid!`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Creates the Genesis Block for the Federation NADA/WADA Immutable Ledger
 */
export function createGenesisBlock(): DopingLedgerBlock {
  const timestamp = "2026-01-01T00:00:00.000Z";
  const previousBlockHash = "0000000000000000000000000000000000000000000000000000000000000000";
  const testCode = "GENESIS-NADA-WPI-2026";
  const athleteId = "FEDERATION_ROOT_ORACLE";

  const dcoSignatureHash = sha256("WADA_CODE_2026_STANDARDS_ESTABLISHED_GENESIS");
  const athleteSignatureHash = sha256("FEDERATION_ATHLETE_COMMISSION_CHARTER");

  const merkleLeaves = [
    testCode,
    athleteId,
    "A-GENESIS-0000",
    "B-GENESIS-0000",
    "100",
    "1.020",
    "6.5",
    dcoSignatureHash,
    athleteSignatureHash,
  ];
  const merkleRoot = computeMerkleRoot(merkleLeaves);

  const blockHash = computeDopingBlockHash({
    blockHeight: 0,
    timestamp,
    previousBlockHash,
    merkleRoot,
    testCode,
    athleteId,
    aSampleBarcode: "A-GENESIS-0000",
    bSampleBarcode: "B-GENESIS-0000",
    dcoSignatureHash,
    athleteSignatureHash,
  });

  return {
    blockHeight: 0,
    timestamp,
    previousBlockHash,
    blockHash,
    merkleRoot,
    testCode,
    meetTitle: "Indian Powerlifting Federation Anti-Doping Genesis Oracle",
    athleteId,
    athleteName: "Federation Clean Sport Standard Baseline",
    athleteConsent: {
      witnessedObservation: true,
      bottlesChosenByAthlete: true,
      barcodesMatched: true,
      noTamperingObserved: true,
      consentTimestamp: timestamp,
      athleteSignatureHash,
    },
    dcoOfficer: {
      name: "Dr. Arvind Rao, MD (National Chief Medical Officer)",
      licenseNumber: "DCO-NADA-IND-001",
      dcoSignatureHash,
      credentialVerified: true,
    },
    chaperone: {
      name: "Head Marshal Office",
      escortConfirmed: true,
      handoverTimestamp: timestamp,
    },
    sampleData: {
      aSampleBarcode: "A-GENESIS-0000",
      bSampleBarcode: "B-GENESIS-0000",
      aBottleSealCode: "SEAL-GENESIS-A",
      bBottleSealCode: "SEAL-GENESIS-B",
      sampleVolumeMl: 100,
      specificGravity: 1.02,
      samplePh: 6.5,
      temperatureCelsius: 36.5,
    },
    declaredSubstances: "Genesis Policy Baseline",
    labDestination: "National Dope Testing Laboratory (NDTL), New Delhi",
    auditStatus: "VERIFIED_GENUINE",
  };
}

/**
 * Creates the Next Immutable Block in the Chain
 */
export function createNextDopingBlock(
  previousBlock: DopingLedgerBlock,
  payload: {
    testCode: string;
    meetTitle: string;
    athleteId: string;
    athleteName: string;
    aSampleBarcode: string;
    bSampleBarcode: string;
    aBottleSealCode?: string;
    bBottleSealCode?: string;
    sampleVolumeMl: number;
    specificGravity: number;
    samplePh: number;
    temperatureCelsius?: number;
    dcoName: string;
    dcoLicenseNumber: string;
    dcoSignatureDataUrl?: string;
    chaperoneName: string;
    athleteDeclaration: string;
    athleteSignatureDataUrl?: string;
    witnessedObservation: boolean;
    bottlesChosenByAthlete: boolean;
    barcodesMatched: boolean;
    noTamperingObserved: boolean;
    labDestination?: string;
  }
): DopingLedgerBlock {
  const blockHeight = previousBlock.blockHeight + 1;
  const timestamp = new Date().toISOString();
  const previousBlockHash = previousBlock.blockHash;

  const aBottleSealCode = payload.aBottleSealCode || `SEAL-A-${Math.floor(10000 + Math.random() * 90000)}`;
  const bBottleSealCode = payload.bBottleSealCode || `SEAL-B-${Math.floor(10000 + Math.random() * 90000)}`;

  // Generate cryptographic signature hashes from signature data or parameters
  const dcoSignatureRaw = payload.dcoSignatureDataUrl || `${payload.dcoName}:${payload.dcoLicenseNumber}:${timestamp}`;
  const dcoSignatureHash = sha256(`DCO_SIG:${dcoSignatureRaw}`);

  const athleteSignatureRaw =
    payload.athleteSignatureDataUrl || `${payload.athleteName}:${payload.athleteId}:${payload.testCode}:${timestamp}`;
  const athleteSignatureHash = sha256(`ATHLETE_CONSENT_SIG:${athleteSignatureRaw}`);

  const merkleLeaves = [
    payload.testCode,
    payload.athleteId,
    payload.aSampleBarcode,
    payload.bSampleBarcode,
    payload.sampleVolumeMl.toString(),
    payload.specificGravity.toString(),
    payload.samplePh.toString(),
    dcoSignatureHash,
    athleteSignatureHash,
  ];

  const merkleRoot = computeMerkleRoot(merkleLeaves);

  const blockHash = computeDopingBlockHash({
    blockHeight,
    timestamp,
    previousBlockHash,
    merkleRoot,
    testCode: payload.testCode,
    athleteId: payload.athleteId,
    aSampleBarcode: payload.aSampleBarcode,
    bSampleBarcode: payload.bSampleBarcode,
    dcoSignatureHash,
    athleteSignatureHash,
  });

  return {
    blockHeight,
    timestamp,
    previousBlockHash,
    blockHash,
    merkleRoot,
    testCode: payload.testCode,
    meetTitle: payload.meetTitle,
    athleteId: payload.athleteId,
    athleteName: payload.athleteName,
    athleteConsent: {
      witnessedObservation: payload.witnessedObservation,
      bottlesChosenByAthlete: payload.bottlesChosenByAthlete,
      barcodesMatched: payload.barcodesMatched,
      noTamperingObserved: payload.noTamperingObserved,
      consentTimestamp: timestamp,
      athleteSignatureDataUrl: payload.athleteSignatureDataUrl,
      athleteSignatureHash,
    },
    dcoOfficer: {
      name: payload.dcoName,
      licenseNumber: payload.dcoLicenseNumber,
      dcoSignatureDataUrl: payload.dcoSignatureDataUrl,
      dcoSignatureHash,
      credentialVerified: true,
    },
    chaperone: {
      name: payload.chaperoneName,
      escortConfirmed: true,
      handoverTimestamp: timestamp,
    },
    sampleData: {
      aSampleBarcode: payload.aSampleBarcode,
      bSampleBarcode: payload.bSampleBarcode,
      aBottleSealCode,
      bBottleSealCode,
      sampleVolumeMl: payload.sampleVolumeMl,
      specificGravity: payload.specificGravity,
      samplePh: payload.samplePh,
      temperatureCelsius: payload.temperatureCelsius || 36.6,
    },
    declaredSubstances: payload.athleteDeclaration,
    labDestination:
      payload.labDestination || "National Dope Testing Laboratory (NDTL), WADA-Accredited, New Delhi",
    auditStatus: "VERIFIED_GENUINE",
  };
}

/**
 * Pre-seeded Initial Valid Chain with Genesis + Sample Records
 */
export function getInitialLedgerChain(): DopingLedgerBlock[] {
  const genesis = createGenesisBlock();

  const block1 = createNextDopingBlock(genesis, {
    testCode: "NADA-2026-IND-0891",
    meetTitle: "Indian National Senior Men & Women Powerlifting Championship 2026",
    athleteId: "ath-patel-083",
    athleteName: "Patel Rakesh",
    aSampleBarcode: "A-NADA-88492-SEC",
    bSampleBarcode: "B-NADA-88493-SEC",
    aBottleSealCode: "SEAL-A-90412",
    bBottleSealCode: "SEAL-B-90413",
    sampleVolumeMl: 105,
    specificGravity: 1.018,
    samplePh: 6.2,
    temperatureCelsius: 36.7,
    dcoName: "Dr. Arvind Rao, MD (Senior NADA DCO)",
    dcoLicenseNumber: "DCO-NADA-IND-042",
    chaperoneName: "Inspector Rajesh Kumar (Police Sports Board)",
    athleteDeclaration:
      "Asthalin Inhaler (Salbutamol 200mcg inhaled under approved TUE #TUE-2026-081) and Whey Protein Isolate.",
    witnessedObservation: true,
    bottlesChosenByAthlete: true,
    barcodesMatched: true,
    noTamperingObserved: true,
  });

  const block2 = createNextDopingBlock(block1, {
    testCode: "NADA-2026-IND-0892",
    meetTitle: "Indian National Senior Men & Women Powerlifting Championship 2026",
    athleteId: "ath-vikram-093",
    athleteName: "Vikramjit Singh",
    aSampleBarcode: "A-NADA-88494-SEC",
    bSampleBarcode: "B-NADA-88495-SEC",
    aBottleSealCode: "SEAL-A-90414",
    bBottleSealCode: "SEAL-B-90415",
    sampleVolumeMl: 98,
    specificGravity: 1.022,
    samplePh: 6.5,
    temperatureCelsius: 36.8,
    dcoName: "Dr. Arvind Rao, MD (Senior NADA DCO)",
    dcoLicenseNumber: "DCO-NADA-IND-042",
    chaperoneName: "Mahesh Patil",
    athleteDeclaration: "Multivitamin tablet, Omega-3 Fish Oil, Creatine Monohydrate.",
    witnessedObservation: true,
    bottlesChosenByAthlete: true,
    barcodesMatched: true,
    noTamperingObserved: true,
  });

  return [genesis, block1, block2];
}
