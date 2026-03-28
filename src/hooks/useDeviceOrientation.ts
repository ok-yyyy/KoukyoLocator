import { calcCompassHeading, normalizeDegrees } from "@/utils/navigation";
import type { DeviceType } from "@/utils/device";
import { useCallback, useEffect, useRef, useState } from "react";

export type DeviceOrientationStatus =
  | "idle"
  | "needs-activation"
  | "starting"
  | "tracking"
  | "denied"
  | "unsupported"
  | "error";

type UseDeviceOrientationResult = {
  heading: number | null;
  status: DeviceOrientationStatus;
  start: () => Promise<void>;
};

type PermissionRequestCapableDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

type IOSDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

const useDeviceOrientation = (deviceType: DeviceType): UseDeviceOrientationResult => {
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState<DeviceOrientationStatus>(
    deviceType === "iphone" ? "needs-activation" : "idle",
  );
  const isActive = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    isActive.current = false;
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined" || typeof window.DeviceOrientationEvent === "undefined") {
      setStatus("unsupported");
      return;
    }

    if (isActive.current) return;

    stop();
    setStatus("starting");

    try {
      switch (deviceType) {
        case "iphone": {
          const deviceOrientationEvent =
            window.DeviceOrientationEvent as PermissionRequestCapableDeviceOrientationEvent;
          if (typeof deviceOrientationEvent.requestPermission === "function") {
            const permission = await deviceOrientationEvent.requestPermission();
            if (permission !== "granted") {
              setStatus("denied");
              return;
            }
          }

          const iphoneHandler = (event: Event) => {
            const orientationEvent = event as IOSDeviceOrientationEvent;
            if (typeof orientationEvent.webkitCompassHeading !== "number") {
              return;
            }

            setHeading(normalizeDegrees(orientationEvent.webkitCompassHeading));
            setStatus("tracking");
          };

          window.addEventListener("deviceorientation", iphoneHandler, true);
          cleanupRef.current = () => {
            window.removeEventListener("deviceorientation", iphoneHandler, true);
          };

          isActive.current = true;
          break;
        }

        case "android": {
          const androidHandler = (event: any) => {
            if (
              typeof event.alpha !== "number" ||
              typeof event.beta !== "number" ||
              typeof event.gamma !== "number"
            ) {
              return;
            }

            setHeading(calcCompassHeading(event.alpha, event.beta, event.gamma));
            setStatus("tracking");
          };

          window.addEventListener("deviceorientationabsolute", androidHandler, true);
          cleanupRef.current = () => {
            window.removeEventListener("deviceorientationabsolute", androidHandler, true);
          };

          isActive.current = true;
          break;
        }

        default:
          setStatus("unsupported");
          return;
      }
    } catch {
      stop();
      setStatus("error");
    }
  }, [deviceType, stop]);

  useEffect(() => stop, [stop]);

  return { heading, status, start };
};

export default useDeviceOrientation;
