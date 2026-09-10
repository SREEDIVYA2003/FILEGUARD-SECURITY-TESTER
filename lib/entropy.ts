/**
 * Calculates Shannon Entropy for an ArrayBuffer.
 * Value ranges from 0.00 (completely uniform/zero variance) to 8.00 (maximum randomness/encrypted/packed).
 */
export function calculateShannonEntropy(buffer: ArrayBuffer): number {
  const byteCounts = new Uint32Array(256);
  const bytes = new Uint8Array(buffer);
  const length = bytes.length;

  if (length === 0) return 0;

  for (let i = 0; i < length; i++) {
    byteCounts[bytes[i]]++;
  }

  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (byteCounts[i] > 0) {
      const p = byteCounts[i] / length;
      entropy -= p * (Math.log2 ? Math.log2(p) : Math.log(p) / Math.LN2);
    }
  }

  return Math.min(8.0, Math.max(0.0, parseFloat(entropy.toFixed(3))));
}
