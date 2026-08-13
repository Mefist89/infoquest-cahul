import { parseBuffer } from "music-metadata";

export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
export const MAX_AUDIO_DURATION_SECONDS = 60;
export const MAX_TRANSCRIPT_CHARACTERS = 6_000;
export const MAX_MULTIPART_BYTES = MAX_AUDIO_BYTES + 256 * 1024;

type AudioFormat = {
  extension: "aac" | "flac" | "m4a" | "mp3" | "ogg" | "wav" | "webm";
  mimeType: string;
};

export type AudioValidationCode = "audio_format" | "audio_duration" | "audio_silent" | "transcript_size";

export class AudioValidationError extends Error {
  constructor(readonly code: AudioValidationCode) {
    super(code);
    this.name = "AudioValidationError";
  }
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return new TextDecoder("ascii").decode(bytes.subarray(offset, offset + length));
}

export function detectAudioFormat(bytes: Uint8Array): AudioFormat | null {
  if (bytes.length < 12) return null;
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WAVE") return { extension: "wav", mimeType: "audio/wav" };
  if (ascii(bytes, 0, 4) === "fLaC") return { extension: "flac", mimeType: "audio/flac" };
  if (ascii(bytes, 0, 4) === "OggS") return { extension: "ogg", mimeType: "audio/ogg" };
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return { extension: "webm", mimeType: "audio/webm" };
  if (ascii(bytes, 4, 4) === "ftyp") return { extension: "m4a", mimeType: "audio/mp4" };
  const looksLikeMp3Frame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0 && ((bytes[1] >> 3) & 0x03) !== 0x01 && ((bytes[1] >> 1) & 0x03) !== 0x00;
  if (ascii(bytes, 0, 3) === "ID3" || looksLikeMp3Frame) return { extension: "mp3", mimeType: "audio/mpeg" };
  if (bytes[0] === 0xff && (bytes[1] & 0xf6) === 0xf0) return { extension: "aac", mimeType: "audio/aac" };
  return null;
}

function readPcmSample(view: DataView, offset: number, bitsPerSample: number, floatingPoint: boolean) {
  if (floatingPoint && bitsPerSample === 32) return view.getFloat32(offset, true);
  if (bitsPerSample === 8) return (view.getUint8(offset) - 128) / 128;
  if (bitsPerSample === 16) return view.getInt16(offset, true) / 32_768;
  if (bitsPerSample === 24) {
    const unsigned = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
    const signed = unsigned & 0x800000 ? unsigned | 0xff000000 : unsigned;
    return signed / 8_388_608;
  }
  if (bitsPerSample === 32) return view.getInt32(offset, true) / 2_147_483_648;
  return null;
}

export function getWavRms(bytes: Uint8Array): number | null {
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WAVE") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let audioFormat = 0;
  let bitsPerSample = 0;
  let dataOffset = 0;
  let dataLength = 0;

  while (offset + 8 <= bytes.length) {
    const chunkId = ascii(bytes, offset, 4);
    const chunkLength = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    if (chunkStart + chunkLength > bytes.length) return null;
    if (chunkId === "fmt " && chunkLength >= 16) {
      audioFormat = view.getUint16(chunkStart, true);
      bitsPerSample = view.getUint16(chunkStart + 14, true);
    } else if (chunkId === "data") {
      dataOffset = chunkStart;
      dataLength = chunkLength;
      break;
    }
    offset = chunkStart + chunkLength + (chunkLength % 2);
  }

  const bytesPerSample = bitsPerSample / 8;
  if (![1, 3].includes(audioFormat) || ![1, 2, 3, 4].includes(bytesPerSample) || dataLength < bytesPerSample) return null;
  let sumSquares = 0;
  let samples = 0;
  for (let sampleOffset = dataOffset; sampleOffset + bytesPerSample <= dataOffset + dataLength; sampleOffset += bytesPerSample) {
    const sample = readPcmSample(view, sampleOffset, bitsPerSample, audioFormat === 3);
    if (sample === null || !Number.isFinite(sample)) return null;
    sumSquares += sample * sample;
    samples += 1;
  }
  return samples > 0 ? Math.sqrt(sumSquares / samples) : null;
}

export async function validateAudioFile(file: File) {
  if (file.size <= 0 || file.size > MAX_AUDIO_BYTES) throw new AudioValidationError("audio_format");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectAudioFormat(bytes);
  if (!detected) throw new AudioValidationError("audio_format");

  let duration: number | undefined;
  try {
    const metadata = await parseBuffer(bytes, detected.mimeType, { duration: true, skipCovers: true });
    if (metadata.format.hasAudio === false) throw new AudioValidationError("audio_format");
    duration = metadata.format.duration;
  } catch {
    throw new AudioValidationError("audio_format");
  }
  if (!duration || !Number.isFinite(duration) || duration < 0.5 || duration > MAX_AUDIO_DURATION_SECONDS + 0.5) {
    throw new AudioValidationError("audio_duration");
  }

  if (detected.extension === "wav") {
    const rms = getWavRms(bytes);
    if (rms === null) throw new AudioValidationError("audio_format");
    if (rms < 0.0015) throw new AudioValidationError("audio_silent");
  }

  return new File([bytes], `recording.${detected.extension}`, { type: detected.mimeType });
}

export function validateTranscript(transcript: string) {
  const normalized = transcript.trim();
  const meaningfulCharacters = normalized.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  if (meaningfulCharacters < 2) throw new AudioValidationError("audio_silent");
  if (normalized.length > MAX_TRANSCRIPT_CHARACTERS) throw new AudioValidationError("transcript_size");
  return normalized;
}
