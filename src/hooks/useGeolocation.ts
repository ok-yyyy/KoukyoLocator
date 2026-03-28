import type { LatLng } from "@/utils/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type GeolocationStatus =
  | "idle"
  | "starting"
  | "tracking"
  | "denied"
  | "unsupported"
  | "error";

type useGeolocationResult = {
  position: LatLng | null;
  status: GeolocationStatus;
  start: () => void;
};

const useGeolocation = (options?: PositionOptions): useGeolocationResult => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    if (watchId.current !== null) return;

    setStatus("starting");

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("tracking");
      },
      (err) => {
        watchId.current = null;
        setStatus(err.code === GeolocationPositionError.PERMISSION_DENIED ? "denied" : "error");
      },
      options,
    );
  }, [options]);

  useEffect(() => stop, [stop]);

  return { position, status, start };
};

export default useGeolocation;
