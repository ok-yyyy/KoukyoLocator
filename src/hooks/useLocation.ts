import useGeolocation, { type GeolocationStatus } from "@/hooks/useGeolocation";
import useDeviceOrientation, { type DeviceOrientationStatus } from "@/hooks/useDeviceOrientation";
import { getDeviceType } from "@/utils/device";
import { calcBearing, calcDistance, calcRelativeDirection, type LatLng } from "@/utils/navigation";

type LocationStatus =
  | "idle"
  | "needs-activation"
  | "starting"
  | "tracking"
  | "denied"
  | "unsupported"
  | "error";

type UseLocationResult = {
  distance: number | null;
  direction: number | null;
  status: LocationStatus;
  activate: () => Promise<void>;
  errorMessage: string | null;
};

const DEVICE_TYPE = getDeviceType();

const useLocation = (dst: LatLng): UseLocationResult => {
  const { position, status: geolocationStatus, start: startGeolocation } = useGeolocation();
  const {
    heading,
    status: orientationStatus,
    start: startDeviceOrientation,
  } = useDeviceOrientation(DEVICE_TYPE);

  const activate = async () => {
    startGeolocation();
    await startDeviceOrientation();
  };

  const distance = position ? calcDistance(position, dst) : null;
  const bearing = position ? calcBearing(position, dst) : null;
  const direction =
    bearing !== null && heading !== null ? calcRelativeDirection(heading, bearing) : null;

  const status = resolveStatus(geolocationStatus, orientationStatus, heading, position);
  const errorMessage = resolveErrorMessage(geolocationStatus, orientationStatus);

  return {
    distance,
    direction,
    status,
    activate,
    errorMessage,
  };
};

const resolveStatus = (
  geolocationStatus: GeolocationStatus,
  orientationStatus: DeviceOrientationStatus,
  heading: number | null,
  position: LatLng | null,
): LocationStatus => {
  if (orientationStatus === "denied" || geolocationStatus === "denied") {
    return "denied";
  }

  if (orientationStatus === "error" || geolocationStatus === "error") {
    return "error";
  }

  if (orientationStatus === "unsupported" || geolocationStatus === "unsupported") {
    return "unsupported";
  }

  if (orientationStatus === "starting" || geolocationStatus === "starting") {
    return "starting";
  }

  if (orientationStatus === "needs-activation") {
    return "needs-activation";
  }

  if (heading !== null && position !== null) {
    return "tracking";
  }

  if (orientationStatus === "tracking" || geolocationStatus === "tracking") {
    return "starting";
  }

  return "idle";
};

const resolveErrorMessage = (
  geolocationStatus: GeolocationStatus,
  orientationStatus: DeviceOrientationStatus,
): string | null => {
  if (orientationStatus === "denied") {
    return "端末の向きセンサーへのアクセスが拒否されました。";
  }

  if (geolocationStatus === "denied") {
    return "位置情報へのアクセスが拒否されました。";
  }

  if (orientationStatus === "unsupported") {
    return "この端末またはブラウザは方位センサーに対応していません。";
  }

  if (geolocationStatus === "unsupported") {
    return "このブラウザは位置情報 API に対応していません。";
  }

  if (orientationStatus === "error" || geolocationStatus === "error") {
    return "センサー情報の取得中にエラーが発生しました。";
  }

  return null;
};

export default useLocation;
