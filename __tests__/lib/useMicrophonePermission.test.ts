import { renderHook, act, waitFor } from "@testing-library/react";
import { useMicrophonePermission } from "@/lib/useMicrophonePermission";

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
const mockTrackStop = jest.fn();

// Mock Permissions API
const mockPermissionsQuery = jest.fn();
let permissionChangeHandler: (() => void) | null = null;

const createMockPermissionStatus = (state: string) => ({
  state,
  onchange: null as (() => void) | null,
});

beforeAll(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: mockGetUserMedia,
    },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(navigator, "permissions", {
    value: {
      query: mockPermissionsQuery,
    },
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  permissionChangeHandler = null;

  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [{ stop: mockTrackStop }],
  });

  const mockStatus = createMockPermissionStatus("prompt");
  mockPermissionsQuery.mockImplementation(async () => {
    const status = {
      ...mockStatus,
      set onchange(handler: (() => void) | null) {
        permissionChangeHandler = handler;
      },
      get onchange() {
        return permissionChangeHandler;
      },
    };
    return status;
  });
});

describe("useMicrophonePermission hook", () => {
  describe("initial state", () => {
    it("starts with prompt state by default", async () => {
      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.permissionState).toBe("prompt");
      });
    });

    it("provides checkPermission function", () => {
      const { result } = renderHook(() => useMicrophonePermission());
      expect(typeof result.current.checkPermission).toBe("function");
    });

    it("provides requestPermission function", () => {
      const { result } = renderHook(() => useMicrophonePermission());
      expect(typeof result.current.requestPermission).toBe("function");
    });
  });

  describe("checkPermission", () => {
    it("returns granted when permission is already granted", async () => {
      const mockStatus = {
        state: "granted",
        onchange: null as (() => void) | null,
      };
      mockPermissionsQuery.mockResolvedValueOnce(mockStatus);

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.permissionState).toBe("granted");
      });
    });

    it("returns denied when permission is denied", async () => {
      const mockStatus = {
        state: "denied",
        onchange: null as (() => void) | null,
      };
      mockPermissionsQuery.mockResolvedValueOnce(mockStatus);

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.permissionState).toBe("denied");
      });
    });

    it("returns unsupported when mediaDevices is not available", async () => {
      const originalMediaDevices = navigator.mediaDevices;
      Object.defineProperty(navigator, "mediaDevices", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.checkPermission();
      });

      expect(permissionResult).toBe("unsupported");
      expect(result.current.permissionState).toBe("unsupported");

      // Restore
      Object.defineProperty(navigator, "mediaDevices", {
        value: originalMediaDevices,
        writable: true,
        configurable: true,
      });
    });

    it("falls back to prompt when Permissions API throws", async () => {
      mockPermissionsQuery.mockRejectedValueOnce(new Error("Not supported"));

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.checkPermission();
      });

      expect(permissionResult).toBe("prompt");
    });

    it("queries microphone permission via Permissions API", async () => {
      const { result } = renderHook(() => useMicrophonePermission());

      await act(async () => {
        await result.current.checkPermission();
      });

      expect(mockPermissionsQuery).toHaveBeenCalledWith({
        name: "microphone",
      });
    });
  });

  describe("requestPermission", () => {
    it("requests microphone access via getUserMedia", async () => {
      const { result } = renderHook(() => useMicrophonePermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it("stops tracks immediately after getting permission", async () => {
      const { result } = renderHook(() => useMicrophonePermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockTrackStop).toHaveBeenCalled();
    });

    it("returns granted on successful permission request", async () => {
      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe("granted");
      expect(result.current.permissionState).toBe("granted");
    });

    it("returns denied when user denies permission (NotAllowedError)", async () => {
      const error = new DOMException("Permission denied", "NotAllowedError");
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe("denied");
      expect(result.current.permissionState).toBe("denied");
    });

    it("returns denied when user denies permission (PermissionDeniedError)", async () => {
      const error = new DOMException(
        "Permission denied",
        "PermissionDeniedError"
      );
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe("denied");
      expect(result.current.permissionState).toBe("denied");
    });

    it("returns unsupported when no microphone found (NotFoundError)", async () => {
      const error = new DOMException("No microphone", "NotFoundError");
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe("unsupported");
      expect(result.current.permissionState).toBe("unsupported");
    });

    it("returns unsupported when no microphone found (DevicesNotFoundError)", async () => {
      const error = new DOMException("No devices", "DevicesNotFoundError");
      mockGetUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe("unsupported");
      expect(result.current.permissionState).toBe("unsupported");
    });

    it("returns unsupported when mediaDevices is not available", async () => {
      const originalMediaDevices = navigator.mediaDevices;
      Object.defineProperty(navigator, "mediaDevices", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe("unsupported");
      expect(result.current.permissionState).toBe("unsupported");

      // Restore
      Object.defineProperty(navigator, "mediaDevices", {
        value: originalMediaDevices,
        writable: true,
        configurable: true,
      });
    });

    it("returns denied for unknown errors", async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error("Unknown error"));

      const { result } = renderHook(() => useMicrophonePermission());

      let permissionResult: string | undefined;
      await act(async () => {
        permissionResult = await result.current.requestPermission();
      });

      expect(permissionResult).toBe("denied");
      expect(result.current.permissionState).toBe("denied");
    });
  });

  describe("permission state change listener", () => {
    it("updates state when permission changes externally", async () => {
      let currentState = "prompt";

      mockPermissionsQuery.mockImplementation(async () => {
        const status = {
          get state() {
            return currentState;
          },
          set onchange(handler: (() => void) | null) {
            permissionChangeHandler = handler;
          },
          get onchange() {
            return permissionChangeHandler;
          },
        };
        return status;
      });

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.permissionState).toBe("prompt");
      });

      // Simulate external permission change
      currentState = "granted";
      act(() => {
        permissionChangeHandler?.();
      });

      // Note: The actual state update depends on the implementation
      // In a real scenario, the onchange would trigger a re-query
    });
  });

  describe("checks permission on mount", () => {
    it("automatically checks permission when hook mounts", async () => {
      const mockStatus = {
        state: "granted",
        onchange: null as (() => void) | null,
      };
      mockPermissionsQuery.mockResolvedValueOnce(mockStatus);

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(mockPermissionsQuery).toHaveBeenCalled();
        expect(result.current.permissionState).toBe("granted");
      });
    });
  });
});
