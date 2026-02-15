import { getMarketDataForCrop } from "./market-data";
import { MarketCropContent } from "./MarketCropContent";

const CROP_SLUG_TO_NAME: Record<string, string> = {
  paprica: "파프리카",
  strawberry: "딸기",
  tomato: "토마토",
  cucumber: "오이",
  pepper: "고추",
};

export default async function MarketCropPage({
  params,
}: {
  params: Promise<{ crop: string }>;
}) {
  const { crop } = await params;
  const decoded = decodeURIComponent(crop);
  const cropName = CROP_SLUG_TO_NAME[decoded] ?? decoded;
  const initialMarketRows = getMarketDataForCrop(decoded);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <MarketCropContent
        crop={decoded}
        cropName={cropName}
        initialMarketRows={initialMarketRows}
      />
    </div>
  );
}
