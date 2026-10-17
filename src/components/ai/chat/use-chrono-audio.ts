"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import type { ChatContent } from "./content";
import type { Attachment } from "./types";
import { convertToWhisperWav } from "./wav";

/**
 * Запись голоса, выбор файла и конвертация в WAV для Chrono.
 * Держит собственные ошибки записи (speechError), вложение и трекинг URL
 * вложений, чтобы главная страница могла корректно освобождать память.
 */
export function useChronoAudio({ t }: { t: ChatContent }) {
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [listening, setListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileUrlsRef = useRef<string[]>([]);
  const discardRecordingRef = useRef(false);

  useEffect(() => {
    if (!listening) return;
    const timer = window.setInterval(() => setRecordingSeconds((seconds) => Math.min(60, seconds + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [listening]);

  useEffect(() => () => {
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    fileUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const hasAudioExtension = /\.(mp3|m4a|wav|webm|weba|ogg|aac|flac)$/i.test(file.name);
    if ((!file.type.startsWith("audio/") && !hasAudioExtension) || file.size > 4 * 1024 * 1024) {
      setSpeechError(t.fileError);
      event.target.value = "";
      return;
    }
    let preparedFile = file;
    if (/\.weba?m?$/i.test(file.name) || file.type.includes("webm") || file.type === "audio/weba") {
      try {
        const wav = await convertToWhisperWav(file);
        preparedFile = new File([wav], file.name.replace(/\.web[am]$/i, ".wav"), { type: "audio/wav" });
      } catch {
        setSpeechError(t.fileError);
        event.target.value = "";
        return;
      }
    }
    const url = URL.createObjectURL(preparedFile);
    fileUrlsRef.current.push(url);
    setSpeechError(null);
    setAttachment({ name: preparedFile.name, url, file: preparedFile });
    event.target.value = "";
  }

  async function toggleMicrophone(consented: boolean) {
    setSpeechError(null);
    if (listening) {
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      return;
    }

    if (!consented) {
      setSpeechError(t.consentRequired);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      setSpeechError(t.unsupported);
      return;
    }

    try {
      setRecordingSeconds(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setListening(false);
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          recordedChunksRef.current = [];
          return;
        }
        const mimeType = recorder.mimeType || "audio/webm";
        const recordedBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        recordedChunksRef.current = [];
        if (!recordedBlob.size) {
          setSpeechError(t.fileError);
          return;
        }
        try {
          const wav = await convertToWhisperWav(recordedBlob);
          if (wav.size > 4 * 1024 * 1024) throw new Error("Recording is too large");
          const file = new File([wav], `chrono-${Date.now()}.wav`, { type: "audio/wav" });
          const url = URL.createObjectURL(file);
          fileUrlsRef.current.push(url);
          setAttachment({ name: file.name, url, file });
        } catch {
          setSpeechError(t.fileError);
        }
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setListening(false);
        setSpeechError(t.unsupported);
      };
      recorder.start(1000);
      setListening(true);
      recordingTimeoutRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 60_000);
    } catch {
      setListening(false);
      setSpeechError(t.permission);
    }
  }

  function clearAttachment() {
    setAttachment(null);
  }

  function clearError() {
    setSpeechError(null);
  }

  /** Принудительная остановка записи с отбрасыванием черновика («Новая проверка»). */
  function stopAndDiscard() {
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    recordingTimeoutRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") {
      discardRecordingRef.current = true;
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setListening(false);
    setRecordingSeconds(0);
  }

  /** Отзывает object-URL вложений, которые больше не показываются. */
  function releaseUrls(urls: string[]) {
    urls.forEach((url) => URL.revokeObjectURL(url));
    fileUrlsRef.current = fileUrlsRef.current.filter((url) => !urls.includes(url));
  }

  return {
    attachment,
    listening,
    recordingSeconds,
    speechError,
    clearAttachment,
    clearError,
    releaseUrls,
    selectFile,
    stopAndDiscard,
    toggleMicrophone,
  };
}
