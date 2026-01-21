"use client";

import { useState, useCallback, useEffect } from "react";

export type MicrophonePermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported";

export interface MicrophonePermissionResult {
  permissionState: MicrophonePermissionState;
  checkPermission: () => Promise<MicrophonePermissionState>;
  requestPermission: () => Promise<MicrophonePermissionState>;
}

/**
 * Hook to manage microphone permission state on mobile and desktop.
 * Uses the Permissions API when available, with fallback for older browsers.
 */
export function useMicrophonePermission(): MicrophonePermissionResult {
  const [permissionState, setPermissionState] =
    useState<MicrophonePermissionState>("prompt");

  const checkPermission =
    useCallback(async (): Promise<MicrophonePermissionState> => {
      // Check if mediaDevices API is supported
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setPermissionState("unsupported");
        return "unsupported";
      }

      // Try to use the Permissions API if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });

          const state = result.state as MicrophonePermissionState;
          setPermissionState(state);

          // Listen for permission changes
          result.onchange = () => {
            const newState = result.state as MicrophonePermissionState;
            setPermissionState(newState);
          };

          return state;
        } catch {
          // Permissions API not supported for microphone, return prompt as default
          return "prompt";
        }
      }

      // Fallback: assume prompt state if Permissions API is not available
      return "prompt";
    }, []);

  const requestPermission =
    useCallback(async (): Promise<MicrophonePermissionState> => {
      // Check if mediaDevices API is supported
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setPermissionState("unsupported");
        return "unsupported";
      }

      try {
        // Request microphone access - this will trigger the permission prompt on mobile
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Permission granted - immediately stop the tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());

        setPermissionState("granted");
        return "granted";
      } catch (error) {
        // Check for specific error types
        if (error instanceof DOMException) {
          if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
          ) {
            setPermissionState("denied");
            return "denied";
          }
          if (
            error.name === "NotFoundError" ||
            error.name === "DevicesNotFoundError"
          ) {
            // No microphone available
            setPermissionState("unsupported");
            return "unsupported";
          }
        }

        // Unknown error - treat as denied
        setPermissionState("denied");
        return "denied";
      }
    }, []);

  // Check permission state on mount
  useEffect(() => {
    // Use an async IIFE to handle the async permission check
    // This avoids the setState-in-effect warning since the setState
    // happens after the async operation completes
    const checkInitialPermission = async () => {
      await checkPermission();
    };
    checkInitialPermission();
  }, [checkPermission]);

  return {
    permissionState,
    checkPermission,
    requestPermission,
  };
}
