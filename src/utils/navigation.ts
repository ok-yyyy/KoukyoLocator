export type LatLng = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS = 6738_000;
const DEG_TO_RAD = Math.PI / 180;

const toRad = (deg: number): number => deg * DEG_TO_RAD;

export const normalizeDegrees = (deg: number): number => ((deg % 360) + 360) % 360;

// 2点間の距離を計算する (Haversineの公式)
export function calcDistance(src: LatLng, dst: LatLng): number {
  const srcLat = toRad(src.lat);
  const srcLng = toRad(src.lng);
  const dstLat = toRad(dst.lat);
  const dstLng = toRad(dst.lng);

  const dLat = dstLat - srcLat;
  const dLng = dstLng - srcLng;

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(srcLat) * Math.cos(dstLat) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcBearing(src: LatLng, dst: LatLng): number {
  const srcLat = toRad(src.lat);
  const srcLng = toRad(src.lng);
  const dstLat = toRad(dst.lat);
  const dstLng = toRad(dst.lng);

  const y = Math.sin(dstLng - srcLng) * Math.cos(dstLat);
  const x =
    Math.cos(srcLat) * Math.sin(dstLat) -
    Math.sin(srcLat) * Math.cos(dstLat) * Math.cos(dstLng - srcLng);

  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

export function calcRelativeDirection(heading: number, bearing: number): number {
  return normalizeDegrees(bearing - heading);
}

export function calcCompassHeading(alpha: number, beta: number, gamma: number): number {
  const x = toRad(beta);
  const y = toRad(gamma);
  const z = toRad(alpha);

  // const cX = Math.cos(x);
  const cY = Math.cos(y);
  const cZ = Math.cos(z);
  const sX = Math.sin(x);
  const sY = Math.sin(y);
  const sZ = Math.sin(z);

  const vx = -cZ * sY - sZ * sX * cY;
  const vy = -sZ * sY + cZ * sX * cY;

  return normalizeDegrees((Math.atan2(vx, vy) * 180) / Math.PI);
}
