import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { saleDate, smallCd } = await request.json();

    // 사용자가 제공한 파프리카 기본 코드
    const LARGE_CD = '13';
    const MID_CD = '26';
    const SMALL_CD = smallCd || ''; // 02: 노랑, 03: 빨강 등

    const url = `https://at.agromarket.kr/domeinfo/sanRealtime.do?pageNo=1&saledate=${saleDate}&whsalCd=&cmpCd=&sanCd=&smallCdSearch=&largeCd=${LARGE_CD}&midCd=${MID_CD}&smallCd=${SMALL_CD}&pageSize=1000`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store', // 실시간 데이터를 위해 캐시 비활성화
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const tableData: Array<{
      date: string;
      time: string;
      market: string;
      company: string;
      variety: string;
      unit: string;
      volume: string;
      price: number;
    }> = [];

    $('table.table_type_sub.small tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 12) {
        const rawPrice = $(cells[11]).text().trim().replace(/,/g, ''); // 25,500 -> 25500
        tableData.push({
          date: $(cells[0]).text().trim(),
          time: $(cells[1]).text().trim(),
          market: $(cells[2]).text().trim(),   // 진주
          company: $(cells[3]).text().trim(),  // 진주원협(공)
          variety: $(cells[7]).text().trim(),  // 빨강파프리카
          unit: $(cells[9]).text().trim(),     // 5kg 상자
          volume: $(cells[10]).text().trim(),  // 물량
          price: parseInt(rawPrice, 10) || 0, // 경락가 (숫자형)
        });
      }
    });

    return NextResponse.json(tableData);
  } catch (error) {
    const message = error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
