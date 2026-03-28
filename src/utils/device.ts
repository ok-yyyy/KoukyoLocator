export type DeviceType = "iphone" | "android" | "unknown";

export const getDeviceType = (): DeviceType => {
  if (typeof navigator === "undefined") return "unknown";

  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "iphone";
  if (/Android/.test(ua)) return "android";
  return "unknown";
};
