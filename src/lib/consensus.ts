
/**
 * Calculates a reliable consensus price from a set of submissions.
 * Uses Median Absolute Deviation (MAD) to filter outliers and Gaussian weighting 
 * for the final average.
 */
export function calculateConsensusPrice(prices: number[]): { 
  consensus: number; 
  count: number;
  outliers: number;
} {
  if (prices.length === 0) return { consensus: 0, count: 0, outliers: 0 };
  if (prices.length === 1) return { consensus: prices[0], count: 1, outliers: 0 };

  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;

  // Calculate MAD
  const absoluteDeviations = prices.map(p => Math.abs(p - median));
  const sortedDeviations = [...absoluteDeviations].sort((a, b) => a - b);
  const mad = sortedDeviations.length % 2 !== 0 
    ? sortedDeviations[mid] 
    : (sortedDeviations[mid - 1] + sortedDeviations[mid]) / 2;

  // If MAD is 0 (all prices same), consensus is median
  if (mad === 0) return { consensus: median, count: prices.length, outliers: 0 };

  // Gaussian Weighting & Outlier reduction
  // Standard Deviation proxy: 1.4826 * MAD
  const sigma = 1.4826 * mad;
  
  let weightedSum = 0;
  let weightTotal = 0;
  let outlierCount = 0;

  prices.forEach(p => {
    const zScore = Math.abs(p - median) / sigma;
    
    // Outlier check (z-score > 3 is standard for aggressive filtering)
    if (zScore > 3) {
      outlierCount++;
      return;
    }

    // Gaussian weight: exp(-0.5 * z^2)
    const weight = Math.exp(-0.5 * Math.pow(zScore, 2));
    weightedSum += p * weight;
    weightTotal += weight;
  });

  const consensus = weightTotal > 0 ? weightedSum / weightTotal : median;

  return {
    consensus: Math.round(consensus * 100) / 100,
    count: prices.length - outlierCount,
    outliers: outlierCount
  };
}
