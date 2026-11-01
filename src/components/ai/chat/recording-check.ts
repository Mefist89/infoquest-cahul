export const MIN_RECORDING_SECONDS = 2;

export function isRecordingUsable(duration: number, rms: number): boolean {
  return Number.isFinite(duration) && duration >= MIN_RECORDING_SECONDS
    && Number.isFinite(rms) && rms >= 0.0015;
}
