"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import type { ChatContent } from "@/data/chrono-content";
import type { Attachment } from "./types";
import { convertToWhisperWav } from "./wav";
import { isRecordingUsable, MIN_RECORDING_SECONDS } from "./recording-check";

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
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileUrlsRef = useRef<string[]>([]);
  const [starting, setStarting] = useState(false);
  const [preparingAudio, setPreparingAudio] = useState(false);
  const permissionPendingRef = useRef(false);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (!listening) return;
    const timer = window.setInterval(() => setRecordingSeconds(Math.min(60, Math.floor((performance.now() - startedAtRef.current) / 1000))), 100);
    return () => window.clearInterval(timer);
  }, [listening]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      fileUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
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
    let durationSeconds: number | undefined;
    if (/\.weba?m?$/i.test(file.name) || file.type.includes("webm") || file.type === "audio/weba") {
      try {
        const wav = await convertToWhisperWav(file);
        preparedFile = new File([wav.blob], file.name.replace(/\.web[am]$/i, ".wav"), { type: "audio/wav" });
        durationSeconds = wav.duration;
      } catch {
        setSpeechError(t.fileError);
        event.target.value = "";
        return;
      }
    }
    const url = URL.createObjectURL(preparedFile);
    fileUrlsRef.current.push(url);
    setSpeechError(null);
    setAttachment({ name: preparedFile.name, url, file: preparedFile, durationSeconds });
    event.target.value = "";
  }

  async function toggleMicrophone(consented: boolean) {
    if (permissionPendingRef.current) return;
    const current = mediaRecorderRef.current;
    if (current?.state === "recording") {
      if (performance.now() - startedAtRef.current < MIN_RECORDING_SECONDS * 1000) return;
      setPreparingAudio(true);
      setListening(false);
      current.stop();
      return;
    }
    if (busyRef.current || permissionPendingRef.current) return;
    setSpeechError(null);
    if (!consented) { setSpeechError(t.consentRequired); return; }
    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      setSpeechError(t.unsupported);
      return;
    }

    busyRef.current = true;
    permissionPendingRef.current = true;
    setStarting(true);
    setAttachment(null);
    setRecordingSeconds(0);
    const generation = ++generationRef.current;
    let stream: MediaStream | null = null;
    const isCurrent = () => mountedRef.current && generationRef.current === generation;
    const clearTimer = () => {
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    };
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isCurrent()) {
        permissionPendingRef.current = false;
        stream.getTracks().forEach(track => track.stop());
        if (mountedRef.current) setStarting(false);
        return;
      }
      mediaStreamRef.current = stream;
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(type =>
        typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      const release = () => {
        stream?.getTracks().forEach(track => track.stop());
        if (mediaStreamRef.current === stream) mediaStreamRef.current = null;
        if (mediaRecorderRef.current === recorder) mediaRecorderRef.current = null;
      };
      recorder.ondataavailable = event => { if (event.data.size > 0) chunks.push(event.data); };
      recorder.onstop = async () => {
        release();
        if (!isCurrent()) return;
        clearTimer();
        setListening(false);
        setPreparingAudio(true);
        try {
          const recordedBlob = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type || "audio/webm" });
          if (!recordedBlob.size) throw new Error("Empty recording");
          const { blob, duration, rms } = await convertToWhisperWav(recordedBlob);
          if (!isCurrent()) return;
          if (!isRecordingUsable(duration, rms)) {
            setSpeechError(t.recordingTooQuiet);
            return;
          }
          if (blob.size > 4 * 1024 * 1024) throw new Error("Recording is too large");
          const file = new File([blob], `chrono-${Date.now()}.wav`, { type: "audio/wav" });
          const url = URL.createObjectURL(file);
          fileUrlsRef.current.push(url);
          setAttachment({ name: file.name, url, file, durationSeconds: duration });
        } catch {
          if (isCurrent()) setSpeechError(t.recordError);
        } finally {
          if (isCurrent()) { busyRef.current = false; setPreparingAudio(false); }
        }
      };
      recorder.onerror = () => {
        release();
        if (!isCurrent()) return;
        generationRef.current += 1;
        clearTimer();
        busyRef.current = false;
        permissionPendingRef.current = false;
        setStarting(false);
        if (recorder.state === "recording") recorder.stop();
        setListening(false);
        setPreparingAudio(false);
        setSpeechError(t.recordError);
      };
      recorder.onstart = () => {
        if (!isCurrent()) return;
        startedAtRef.current = performance.now();
        permissionPendingRef.current = false;
        setStarting(false);
        setListening(true);
        recordingTimeoutRef.current = setTimeout(() => {
          if (isCurrent() && recorder.state === "recording") {
            setPreparingAudio(true);
            setListening(false);
            recorder.stop();
          }
        }, 60_000);
      };
      recorder.start();
    } catch {
      stream?.getTracks().forEach(track => track.stop());
      permissionPendingRef.current = false;
      if (mountedRef.current) setStarting(false);
      if (!isCurrent()) return;
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
      busyRef.current = false;
      setListening(false);
      setPreparingAudio(false);
      setSpeechError(stream ? t.recordError : t.permission);
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
    generationRef.current += 1;
    busyRef.current = false;
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    recordingTimeoutRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    if (mediaRecorderRef.current) {
      permissionPendingRef.current = false;
      setStarting(false);
    }
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    setListening(false);
    setPreparingAudio(false);
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
    starting,
    preparingAudio,
    canStopRecording: listening && recordingSeconds >= MIN_RECORDING_SECONDS,
    speechError,
    clearAttachment,
    clearError,
    releaseUrls,
    selectFile,
    stopAndDiscard,
    toggleMicrophone,
  };
}
