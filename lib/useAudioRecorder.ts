"use client";

import { useState, useRef, useCallback } from "react";
import {
  useMicrophonePermission,
  MicrophonePermissionState,
} from "./useMicrophonePermission";

export type RecordingState = "idle" | "recording" | "processing";

export interface AudioRecorderResult {
  state: RecordingState;
  audioBlob: Blob | null;
  error: string | null;
  permissionState: MicrophonePermissionState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  checkPermission: () => Promise<MicrophonePermissionState>;
  requestPermission: () => Promise<MicrophonePermissionState>;
}

export function useAudioRecorder(): AudioRecorderResult {
  const [state, setState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { permissionState, checkPermission, requestPermission } =
    useMicrophonePermission();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopMediaTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];

      // Check permission state before attempting to record
      if (permissionState === "unsupported") {
        setError("Microphone not supported on this device");
        return;
      }

      if (permissionState === "denied") {
        setError(
          "Microphone access denied. Please enable it in your device settings."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stopMediaTracks();
        setState("idle");
      };

      mediaRecorder.onerror = () => {
        setError("Recording error occurred");
        stopMediaTracks();
        setState("idle");
      };

      mediaRecorder.start();
      setState("recording");
    } catch (err) {
      // Provide user-friendly error messages for permission errors
      if (err instanceof DOMException) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setError(
            "Microphone access denied. Please enable it in your device settings."
          );
          setState("idle");
          return;
        }
        if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setError("No microphone found on this device");
          setState("idle");
          return;
        }
      }

      const message =
        err instanceof Error ? err.message : "Failed to start recording";
      setError(message);
      setState("idle");
    }
  }, [stopMediaTracks, permissionState]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    stopRecording();
    stopMediaTracks();
    setAudioBlob(null);
    setError(null);
    chunksRef.current = [];
    setState("idle");
  }, [stopRecording, stopMediaTracks]);

  return {
    state,
    audioBlob,
    error,
    permissionState,
    startRecording,
    stopRecording,
    resetRecording,
    checkPermission,
    requestPermission,
  };
}
