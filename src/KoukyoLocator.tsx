import useLocation from "@/hooks/useLocation";
import type { LatLng } from "@/utils/navigation";
import koukyoKun from "@/assets/koukyo-kun.png";
import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

const TARGET_LOCATION: LatLng = {
  lat: 35.6825,
  lng: 139.75278,
};

// 画像の向きと実際の方位のズレを補正するためのオフセット角度
const IMAGE_ROTATION_OFFSET_DEG = -22;

function KoukyoLocator() {
  const [isDistanceVisible, setIsDistanceVisible] = useState(true);
  const { distance, direction, status, activate, errorMessage } = useLocation(TARGET_LOCATION);

  const canActivate = status === "idle" || status === "needs-activation";
  const canShowLocator = distance !== null && direction !== null;
  const distanceLabel = distance !== null ? (distance / 1000).toFixed(2) : "---";
  const rotationDeg = direction !== null ? direction - IMAGE_ROTATION_OFFSET_DEG : 0;

  const handleToggleDistance = () => {
    setIsDistanceVisible((prev) => !prev);
  };

  return (
    <div className="flex min-h-dvh flex-col p-4">
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Koukyo Locator</h1>

          {canActivate && (
            <button
              className="rounded-md bg-zinc-200 px-5 py-3 text-sm font-medium text-zinc-900 transition-colors active:bg-zinc-300"
              onClick={activate}
            >
              センサーの使用を許可する
            </button>
          )}

          {errorMessage && (
            <div className="max-w-sm text-sm leading-relaxed text-red-500">{errorMessage}</div>
          )}
        </div>

        {canShowLocator && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-8">
              <div className="flex h-80 w-80 items-center justify-center">
                <img
                  src={koukyoKun}
                  className="max-h-full max-w-full object-contain"
                  style={{ transform: `rotate(${rotationDeg}deg)` }}
                />
              </div>

              <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div></div>
                <div className="text-5xl font-semibold">
                  {isDistanceVisible ? distanceLabel : "---"} km
                </div>
                <button className="rounded-full p-2" onClick={handleToggleDistance}>
                  {isDistanceVisible ? <LuEye size={24} /> : <LuEyeOff size={24} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-2 text-center text-sm text-gray-500">
        <p>Illustrated by Ouri</p>
        <p>Special thanks to Wplace 草の根皇居防衛</p>
      </footer>
    </div>
  );
}

export default KoukyoLocator;
