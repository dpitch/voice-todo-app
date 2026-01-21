import { renderHook, act } from "@testing-library/react";

// Mock useMicrophonePermission hook - must be before importing useAudioRecorder
const mockCheckPermission = jest.fn();
const mockRequestPermission = jest.fn();
let mockPermissionState = "prompt";

jest.mock("../../lib/useMicrophonePermission", () => ({
  useMicrophonePermission: () => ({
    permissionState: mockPermissionState,
    checkPermission: mockCheckPermission,
    requestPermission: mockRequestPermission,
  }),
}));

import { useAudioRecorder } from "@/lib/useAudioRecorder";

// Mock MediaRecorder
const mockStop = jest.fn();
const mockStart = jest.fn();
let mockOnDataAvailable: ((event: { data: Blob }) => void) | null = null;
let mockOnStop: (() => void) | null = null;
let mockOnError: (() => void) | null = null;

const MockMediaRecorder = jest.fn().mockImplementation(() => ({
  start: mockStart,
  stop: mockStop,
  state: "recording",
  ondataavailable: null,
  onstop: null,
  onerror: null,
  set ondataavailable(handler: (event: { data: Blob }) => void) {
    mockOnDataAvailable = handler;
  },
  set onstop(handler: () => void) {
    mockOnStop = handler;
  },
  set onerror(handler: () => void) {
    mockOnError = handler;
  },
}));

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
const mockTrackStop = jest.fn();

beforeAll(() => {
  global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: mockGetUserMedia,
    },
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockOnDataAvailable = null;
  mockOnStop = null;
  mockOnError = null;
  mockPermissionState = "prompt";

  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [{ stop: mockTrackStop }],
  });

  mockCheckPermission.mockResolvedValue("granted");
  mockRequestPermission.mockResolvedValue("granted");
});

describe("useAudioRecorder hook", () => {
  describe("initial state", () => {
    it("starts in idle state", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(result.current.state).toBe("idle");
    });

    it("has null audioBlob initially", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(result.current.audioBlob).toBeNull();
    });

    it("has null error initially", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(result.current.error).toBeNull();
    });

    it("provides startRecording function", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(typeof result.current.startRecording).toBe("function");
    });

    it("provides stopRecording function", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(typeof result.current.stopRecording).toBe("function");
    });

    it("provides resetRecording function", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(typeof result.current.resetRecording).toBe("function");
    });

    it("provides permissionState", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(result.current.permissionState).toBe("prompt");
    });

    it("provides checkPermission function", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(typeof result.current.checkPermission).toBe("function");
    });

    it("provides requestPermission function", () => {
      const { result } = renderHook(() => useAudioRecorder());
      expect(typeof result.current.requestPermission).toBe("function");
    });
  });

  describe("startRecording", () => {
    it("requests microphone permission", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it("creates MediaRecorder with audio/webm mimeType", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(MockMediaRecorder).toHaveBeenCalledWith(expect.anything(), {
        mimeType: "audio/webm",
      });
    });

    it("starts the MediaRecorder", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(mockStart).toHaveBeenCalled();
    });

    it("transitions to recording state", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.state).toBe("recording");
    });

    it("clears previous error on start", async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error("Permission denied"));
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe("Permission denied");

      mockGetUserMedia.mockResolvedValueOnce({
        getTracks: () => [{ stop: mockTrackStop }],
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("error handling", () => {
    it("sets error when getUserMedia fails", async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error("Permission denied"));
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe("Permission denied");
      expect(result.current.state).toBe("idle");
    });

    it("sets generic error message for non-Error rejections", async () => {
      mockGetUserMedia.mockRejectedValueOnce("Unknown error");
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe("Failed to start recording");
    });

    it("sets user-friendly error for NotAllowedError", async () => {
      const error = new DOMException("Permission denied", "NotAllowedError");
      mockGetUserMedia.mockRejectedValueOnce(error);
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe(
        "Microphone access denied. Please enable it in your device settings."
      );
      expect(result.current.state).toBe("idle");
    });

    it("sets user-friendly error for PermissionDeniedError", async () => {
      const error = new DOMException(
        "Permission denied",
        "PermissionDeniedError"
      );
      mockGetUserMedia.mockRejectedValueOnce(error);
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe(
        "Microphone access denied. Please enable it in your device settings."
      );
      expect(result.current.state).toBe("idle");
    });

    it("sets user-friendly error for NotFoundError", async () => {
      const error = new DOMException("No microphone", "NotFoundError");
      mockGetUserMedia.mockRejectedValueOnce(error);
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe("No microphone found on this device");
      expect(result.current.state).toBe("idle");
    });

    it("sets user-friendly error for DevicesNotFoundError", async () => {
      const error = new DOMException("No devices", "DevicesNotFoundError");
      mockGetUserMedia.mockRejectedValueOnce(error);
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe("No microphone found on this device");
      expect(result.current.state).toBe("idle");
    });

    it("handles MediaRecorder error event", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        mockOnError?.();
      });

      expect(result.current.error).toBe("Recording error occurred");
      expect(result.current.state).toBe("idle");
    });
  });

  describe("stopRecording", () => {
    it("stops the MediaRecorder", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.stopRecording();
      });

      expect(mockStop).toHaveBeenCalled();
    });

    it("does nothing if not recording", () => {
      const { result } = renderHook(() => useAudioRecorder());

      act(() => {
        result.current.stopRecording();
      });

      expect(mockStop).not.toHaveBeenCalled();
    });
  });

  describe("recording complete", () => {
    it("creates blob from recorded chunks", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      const testChunk = new Blob(["test"], { type: "audio/webm" });

      act(() => {
        mockOnDataAvailable?.({ data: testChunk });
      });

      act(() => {
        mockOnStop?.();
      });

      expect(result.current.audioBlob).toBeInstanceOf(Blob);
      expect(result.current.audioBlob?.type).toBe("audio/webm");
    });

    it("stops media tracks after recording", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        mockOnStop?.();
      });

      expect(mockTrackStop).toHaveBeenCalled();
    });

    it("stays in recording state until caller resets it", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        mockOnStop?.();
      });

      // State stays at recording until resetRecording is called
      // This allows the caller to process the audioBlob before resetting
      expect(result.current.state).toBe("recording");
      expect(result.current.audioBlob).not.toBeNull();

      act(() => {
        result.current.resetRecording();
      });

      expect(result.current.state).toBe("idle");
      expect(result.current.audioBlob).toBeNull();
    });
  });

  describe("resetRecording", () => {
    it("clears audioBlob", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      const testChunk = new Blob(["test"], { type: "audio/webm" });
      act(() => {
        mockOnDataAvailable?.({ data: testChunk });
        mockOnStop?.();
      });

      expect(result.current.audioBlob).not.toBeNull();

      act(() => {
        result.current.resetRecording();
      });

      expect(result.current.audioBlob).toBeNull();
    });

    it("clears error", async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error("Permission denied"));
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.resetRecording();
      });

      expect(result.current.error).toBeNull();
    });

    it("returns to idle state", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      act(() => {
        result.current.resetRecording();
      });

      expect(result.current.state).toBe("idle");
    });
  });

  describe("permission integration", () => {
    it("prevents recording when permission is unsupported", async () => {
      mockPermissionState = "unsupported";
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe(
        "Microphone not supported on this device"
      );
      expect(result.current.state).toBe("idle");
      expect(mockGetUserMedia).not.toHaveBeenCalled();
    });

    it("prevents recording when permission is denied", async () => {
      mockPermissionState = "denied";
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe(
        "Microphone access denied. Please enable it in your device settings."
      );
      expect(result.current.state).toBe("idle");
      expect(mockGetUserMedia).not.toHaveBeenCalled();
    });

    it("allows recording when permission is granted", async () => {
      mockPermissionState = "granted";
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.state).toBe("recording");
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    it("allows recording when permission is prompt (will trigger browser prompt)", async () => {
      mockPermissionState = "prompt";
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.state).toBe("recording");
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    it("exposes checkPermission from useMicrophonePermission", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.checkPermission();
      });

      expect(mockCheckPermission).toHaveBeenCalled();
    });

    it("exposes requestPermission from useMicrophonePermission", async () => {
      const { result } = renderHook(() => useAudioRecorder());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });
});
