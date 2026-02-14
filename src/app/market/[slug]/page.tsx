const SLUG_TO_NAME: Record<string, string> = {
  paprica: "파프리카",
  strawberry: "딸기",
  tomato: "토마토",
  cucumber: "오이",
  pepper: "고추",
};

export default async function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const name = SLUG_TO_NAME[decoded] ?? decoded;

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <h1 className="text-2xl font-bold text-slate-900">{name} 시장 정보</h1>
      <p className="mt-2 text-slate-600">
        이 페이지에서 {name} 관련 공판장·가격 정보를 제공할 예정입니다.
      </p>
    </div>
  );
}
