const PRESERVED_ANALYSIS_META_KEYS = [
  "id",
  "originalId",
  "type",
  "createdAt",
  "documentId",
  "owner_uid",
  "isPaid",
  "entitlementStatus",
  "entitlementTransactionId",
];

const asAnalysisArray = (analyses) => {
  if (Array.isArray(analyses)) {
    return analyses;
  }

  if (analyses && typeof analyses === "object") {
    return [analyses];
  }

  return [];
};

export const getAnalysisStableId = (analysis) =>
  String(analysis?.id || analysis?.originalId || "")
    .trim();

export const getAnalysisStableFullName = (analysis) =>
  String(analysis?.full_name || "")
    .trim();

export const extractPreservedAnalysisMeta = (analysis) =>
  PRESERVED_ANALYSIS_META_KEYS.reduce((meta, key) => {
    if (analysis?.[key] !== undefined) {
      meta[key] = analysis[key];
    }
    return meta;
  }, {});

export const mergeAnalysisWithPreservedMeta = (
  nextAnalysis,
  existingAnalysis,
  fallbackIdentity = {}
) => {
  const preservedMeta = extractPreservedAnalysisMeta(existingAnalysis);
  const mergedAnalysis = {
    ...nextAnalysis,
    ...preservedMeta,
  };

  const resolvedId =
    preservedMeta.id || nextAnalysis?.id || fallbackIdentity.id || "";
  if (resolvedId) {
    mergedAnalysis.id = resolvedId;
  }

  const resolvedType =
    preservedMeta.type || nextAnalysis?.type || fallbackIdentity.type || "";
  if (resolvedType) {
    mergedAnalysis.type = resolvedType;
  }

  const resolvedCreatedAt =
    preservedMeta.createdAt ||
    nextAnalysis?.createdAt ||
    fallbackIdentity.createdAt ||
    "";
  if (resolvedCreatedAt) {
    mergedAnalysis.createdAt = resolvedCreatedAt;
  }

  return mergedAnalysis;
};

export const findMatchingAnalysisIndex = (analyses, referenceAnalysis) => {
  const normalizedAnalyses = asAnalysisArray(analyses);
  if (!normalizedAnalyses.length || !referenceAnalysis) {
    return -1;
  }

  const referenceId = getAnalysisStableId(referenceAnalysis);
  if (referenceId) {
    const idMatchIndex = normalizedAnalyses.findIndex(
      (analysis) => getAnalysisStableId(analysis) === referenceId
    );
    if (idMatchIndex !== -1) {
      return idMatchIndex;
    }
  }

  const referenceFullName = getAnalysisStableFullName(referenceAnalysis);
  if (!referenceFullName) {
    return -1;
  }

  return normalizedAnalyses.findIndex((analysis) => {
    const analysisId = getAnalysisStableId(analysis);
    if (referenceId && analysisId) {
      return false;
    }

    return getAnalysisStableFullName(analysis) === referenceFullName;
  });
};

export const findMatchingAnalysisByIdentity = (analyses, referenceAnalysis) => {
  const matchIndex = findMatchingAnalysisIndex(analyses, referenceAnalysis);
  if (matchIndex === -1) {
    return null;
  }

  return asAnalysisArray(analyses)[matchIndex] || null;
};

export const markAnalysisPaidInCollection = (analyses, referenceAnalysis) => {
  if (Array.isArray(analyses)) {
    const matchIndex = findMatchingAnalysisIndex(analyses, referenceAnalysis);
    if (matchIndex === -1) {
      return analyses;
    }

    return analyses.map((analysis, index) =>
      index === matchIndex ? { ...analysis, isPaid: true } : analysis
    );
  }

  if (analyses && typeof analyses === "object") {
    const matchesCurrent =
      findMatchingAnalysisIndex([analyses], referenceAnalysis) === 0;
    return matchesCurrent ? { ...analyses, isPaid: true } : analyses;
  }

  return analyses;
};
