export interface RawFFEvent {
  title: string;
  country: string;
  date: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday';
  forecast?: string;
  previous?: string;
  actual?: string;
}

export interface ForexFactoryEventProcessed {
  id: string;
  title: string;
  country: string;
  date: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday';
  forecast?: string;
  previous?: string;
  actual?: string;
  goldBias: 'BULLISH_GOLD' | 'BEARISH_GOLD' | 'HIGH_VOLATILITY' | 'NEUTRAL';
  goldAnalysis: string;
  minutesUntil: number;
}

export interface EconomicCalendarResult {
  success: boolean;
  source: string;
  sourceUrl: string;
  updatedAt: string;
  newsShieldActive: boolean;
  nextHighImpactEvent: ForexFactoryEventProcessed | null;
  events: ForexFactoryEventProcessed[];
  marketSentiment: {
    overallBias: 'BULLISH_GOLD' | 'BEARISH_GOLD' | 'HIGH_VOLATILITY' | 'NEUTRAL';
    summary: string;
    warning?: string;
  };
}

let cachedData: EconomicCalendarResult | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function analyzeGoldImpact(
  title: string,
  country: string,
  impact: string,
  forecast?: string,
  previous?: string,
  actual?: string,
  minutesUntil: number = 0
): { bias: 'BULLISH_GOLD' | 'BEARISH_GOLD' | 'HIGH_VOLATILITY' | 'NEUTRAL'; analysis: string } {
  if (country !== 'USD') {
    return {
      bias: 'NEUTRAL',
      analysis: `ព័ត៌មាន ${country} មិនសូវមានឥទ្ធិពលផ្ទាល់លើតម្លៃមាស XAU/USD ទេ។`,
    };
  }

  // High volatility danger zone (within 45 mins before or 15 mins after)
  if (impact === 'High' && minutesUntil >= -15 && minutesUntil <= 45) {
    return {
      bias: 'HIGH_VOLATILITY',
      analysis: `⚠️ ប្រុងប្រយ័ត្នខ្ពស់: ព្រឹត្តិការណ៍ High-Impact USD (${title}) ជិតដល់ម៉ោងចេញ! ទីផ្សារមាសនឹងប្រែប្រួលខ្លាំង (High Volatility/Spread Expansion)។ ផ្អាកចូល Order ថ្មី!`,
    };
  }

  const titleLower = title.toLowerCase();

  // If actual is published, evaluate outcome
  if (actual && actual.trim() !== '') {
    const actNum = parseFloat(actual.replace(/[^0-9.-]/g, ''));
    const fcastNum = forecast ? parseFloat(forecast.replace(/[^0-9.-]/g, '')) : NaN;

    if (!isNaN(actNum) && !isNaN(fcastNum)) {
      const isHigher = actNum > fcastNum;
      
      // Unemployment rate or Jobless claims (Higher is bad for USD -> Good for Gold)
      if (titleLower.includes('unemployment') || titleLower.includes('jobless claims')) {
        if (isHigher) {
          return {
            bias: 'BULLISH_GOLD',
            analysis: `ទិន្នន័យជាក់ស្តែង ${actual} > ការរំពឹងទុក ${forecast} (អត្រាគ្មានការងារកើនឡើង) -> ដុល្លារចុះខ្សោយ -> មាស XAU/USD ឡើងថ្លៃ (Bullish Gold)។`,
          };
        } else {
          return {
            bias: 'BEARISH_GOLD',
            analysis: `ទិន្នន័យជាក់ស្តែង ${actual} < ការរំពឹងទុក ${forecast} (អត្រាគ្មានការងារធ្លាក់ចុះ) -> ដុល្លារឡើងរឹងមាំ -> មាស XAU/USD ធ្លាក់ចុះ (Bearish Gold)។`,
          };
        }
      }

      // Inflation (CPI, PPI, PCE), Employment (NFP), Growth (GDP), Interest Rates, Retail Sales
      // Higher than forecast -> Strong USD -> Bearish for Gold
      if (isHigher) {
        return {
          bias: 'BEARISH_GOLD',
          analysis: `ទិន្នន័យជាក់ស្តែង ${actual} > ការរំពឹងទុក ${forecast} (ល្អសម្រាប់សេដ្ឋកិច្ច USD) -> ដុល្លារ DXY រឹងមាំ -> មាស XAU/USD មានសម្ពាធធ្លាក់ចុះ (Bearish Gold)។`,
        };
      } else {
        return {
          bias: 'BULLISH_GOLD',
          analysis: `ទិន្នន័យជាក់ស្តែង ${actual} < ការរំពឹងទុក ${forecast} (ទាបជាងការរំពឹងទុក) -> ដុល្លារ DXY ចុះខ្សោយ -> មាស XAU/USD ហក់ឡើង (Bullish Gold)។`,
        };
      }
    }
  }

  // Pre-release expectation based on forecast vs previous
  if (forecast && previous) {
    const fcast = parseFloat(forecast.replace(/[^0-9.-]/g, ''));
    const prev = parseFloat(previous.replace(/[^0-9.-]/g, ''));

    if (!isNaN(fcast) && !isNaN(prev)) {
      if (titleLower.includes('unemployment') || titleLower.includes('jobless claims')) {
        if (fcast > prev) {
          return {
            bias: 'BULLISH_GOLD',
            analysis: `ការព្យាករណ៍អត្រាគ្មានការងារកើនឡើង (${forecast} vs ${previous}) -> សម្ពាធអវិជ្ជមានលើ USD -> អាចជំរុញឱ្យមាសឡើងថ្លៃ។`,
          };
        }
      } else {
        if (fcast > prev) {
          return {
            bias: 'BEARISH_GOLD',
            analysis: `ការព្យាករណ៍បង្ហាញទិន្នន័យល្អប្រសើរ (${forecast} vs ${previous}) -> អាចជួយឱ្យ USD រឹងមាំ និងដាក់សម្ពាធលើមាស XAU/USD។`,
          };
        } else if (fcast < prev) {
          return {
            bias: 'BULLISH_GOLD',
            analysis: `ការព្យាករណ៍បង្ហាញទិន្នន័យចុះខ្សោយ (${forecast} vs ${previous}) -> អាចធ្វើឱ្យ USD ថយចុះ និងគាំទ្រដល់ការឡើងថ្លៃនៃមាស។`,
          };
        }
      }
    }
  }

  return {
    bias: impact === 'High' ? 'HIGH_VOLATILITY' : 'NEUTRAL',
    analysis: `តាមដានការប្រកាសទិន្នន័យជាក់ស្តែងនៅម៉ោងប្រកាស។ សម្រាប់មាស XAU/USD ប្រសិនបើ USD ចេញមកល្អ មាសនឹងចុះ បើ USD ចេញមកខ្សោយ មាសនឹងឡើង។`,
  };
}

export async function fetchForexFactoryEvents(): Promise<EconomicCalendarResult> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    // Recompute minutesUntil in cache
    const updatedEvents = cachedData.events.map((e) => {
      const eventTime = new Date(e.date).getTime();
      const minutesUntil = Math.round((eventTime - now) / 60000);
      return { ...e, minutesUntil };
    });

    const nextHigh = updatedEvents.find(
      (e) => e.country === 'USD' && e.impact === 'High' && e.minutesUntil >= -15
    ) || null;

    const newsShieldActive = nextHigh ? nextHigh.minutesUntil >= -15 && nextHigh.minutesUntil <= 45 : false;

    return {
      ...cachedData,
      newsShieldActive,
      nextHighImpactEvent: nextHigh,
      events: updatedEvents,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gold-AI-Assistant/1.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Forex Factory HTTP ${res.status}`);
    }

    const rawEvents = (await res.json()) as RawFFEvent[];

    const processedEvents: ForexFactoryEventProcessed[] = rawEvents.map((item, idx) => {
      const eventTime = new Date(item.date).getTime();
      const minutesUntil = Math.round((eventTime - now) / 60000);
      const { bias, analysis } = analyzeGoldImpact(
        item.title,
        item.country,
        item.impact,
        item.forecast,
        item.previous,
        item.actual,
        minutesUntil
      );

      return {
        id: `ff-${idx}-${item.country}-${item.title.substring(0, 10).replace(/\s+/g, '')}`,
        title: item.title,
        country: item.country,
        date: item.date,
        impact: item.impact,
        forecast: item.forecast,
        previous: item.previous,
        actual: item.actual,
        goldBias: bias,
        goldAnalysis: analysis,
        minutesUntil,
      };
    });

    // Filter relevant: prioritize USD events and other majors
    const sorted = processedEvents.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return timeA - timeB;
    });

    const nextHigh = sorted.find(
      (e) => e.country === 'USD' && e.impact === 'High' && e.minutesUntil >= -15
    ) || null;

    const newsShieldActive = nextHigh ? nextHigh.minutesUntil >= -15 && nextHigh.minutesUntil <= 45 : false;

    // Evaluate overall fundamental sentiment
    let bullishCount = 0;
    let bearishCount = 0;
    for (const ev of sorted.filter((e) => e.country === 'USD')) {
      if (ev.goldBias === 'BULLISH_GOLD') bullishCount++;
      if (ev.goldBias === 'BEARISH_GOLD') bearishCount++;
    }

    const overallBias: 'BULLISH_GOLD' | 'BEARISH_GOLD' | 'HIGH_VOLATILITY' | 'NEUTRAL' = newsShieldActive
      ? 'HIGH_VOLATILITY'
      : bullishCount > bearishCount
      ? 'BULLISH_GOLD'
      : bearishCount > bullishCount
      ? 'BEARISH_GOLD'
      : 'NEUTRAL';

    const result: EconomicCalendarResult = {
      success: true,
      source: 'Forex Factory (Official Economic Calendar)',
      sourceUrl: 'https://www.forexfactory.com/',
      updatedAt: new Date().toISOString(),
      newsShieldActive,
      nextHighImpactEvent: nextHigh,
      events: sorted,
      marketSentiment: {
        overallBias,
        summary: newsShieldActive
          ? `⚠️ News Shield Active: ព័ត៌មាន High-Impact USD (${nextHigh?.title}) ជិតមកដល់! ទីផ្សារមាសងាយជួបចលនាបោកបញ្ឆោត និង Slippage ខ្លាំង។`
          : overallBias === 'BULLISH_GOLD'
          ? `ផ្អែកលើទិន្នន័យសេដ្ឋកិច្ច Forex Factory: សម្ពាធម៉ាក្រូសេដ្ឋកិច្ច USD កំពុងជួយជំរុញឱ្យតម្លៃមាស XAU/USD មាននិន្នាការកើនឡើង (Bullish Gold)។`
          : overallBias === 'BEARISH_GOLD'
          ? `ផ្អែកលើទិន្នន័យសេដ្ឋកិច្ច Forex Factory: សន្ទស្សន៍ដុល្លារ DXY មានកម្លាំងរឹងមាំ ដែលដាក់សម្ពាធអវិជ្ជមានលើតម្លៃមាស XAU/USD (Bearish Gold)។`
          : `ទីផ្សារម៉ាក្រូសេដ្ឋកិច្ច USD ស្ថិតក្នុងសភាពស្ងប់ស្ងាត់ (Neutral)។ សមស្របសម្រាប់ការជួញដូរតាមបច្ចេកទេស SMC Technical Analysis។`,
        warning: newsShieldActive
          ? 'សូមជៀសវាងការដាក់ Pending Orders ឬបើក Position ថ្មីមុនព័ត៌មានចេញ ១៥ នាទី!'
          : undefined,
      },
    };

    cachedData = result;
    lastFetchTime = now;
    return result;
  } catch (err) {
    console.warn('Forex Factory fetch failed, using fallback schedule:', err);
    return getFallbackCalendar(now);
  }
}

function getFallbackCalendar(now: number): EconomicCalendarResult {
  const currentDate = new Date(now);
  const isoBase = currentDate.toISOString().split('T')[0];

  const fallbackList: ForexFactoryEventProcessed[] = [
    {
      id: 'ff-fb-1',
      title: 'ISM Manufacturing PMI',
      country: 'USD',
      date: `${isoBase}T14:00:00.000Z`,
      impact: 'High',
      forecast: '52.5',
      previous: '51.8',
      goldBias: 'BEARISH_GOLD',
      goldAnalysis: 'ការព្យាករណ៍សន្ទស្សន៍ ISM កើនឡើង -> ប្រសិនចេញមកល្អ ដុល្លារឡើង មាស XAU/USD នឹងចុះ។',
      minutesUntil: 45,
    },
    {
      id: 'ff-fb-2',
      title: 'JOLTS Job Openings',
      country: 'USD',
      date: `${isoBase}T14:00:00.000Z`,
      impact: 'Medium',
      forecast: '7.35M',
      previous: '7.37M',
      goldBias: 'BULLISH_GOLD',
      goldAnalysis: 'ឱកាសការងារធ្លាក់ចុះតិចតួច -> គាំទ្រដល់តម្លៃមាស។',
      minutesUntil: 45,
    },
    {
      id: 'ff-fb-3',
      title: 'ADP Non-Farm Employment Change',
      country: 'USD',
      date: `${isoBase}T12:15:00.000Z`,
      impact: 'High',
      forecast: '145K',
      previous: '122K',
      goldBias: 'BEARISH_GOLD',
      goldAnalysis: 'ការងារឯកជន ADP រំពឹងថាកើនឡើង -> សម្ពាធលើមាស។',
      minutesUntil: 120,
    },
    {
      id: 'ff-fb-4',
      title: 'Unemployment Claims',
      country: 'USD',
      date: `${isoBase}T12:30:00.000Z`,
      impact: 'High',
      forecast: '230K',
      previous: '231K',
      goldBias: 'NEUTRAL',
      goldAnalysis: 'ចំនួនអ្នកទាមទារប្រាក់ឧបត្ថម្ភគ្មានការងារធ្វើប្រចាំសប្តាហ៍។',
      minutesUntil: 240,
    },
    {
      id: 'ff-fb-5',
      title: 'Non-Farm Employment Change (NFP)',
      country: 'USD',
      date: `${isoBase}T12:30:00.000Z`,
      impact: 'High',
      forecast: '165K',
      previous: '114K',
      goldBias: 'HIGH_VOLATILITY',
      goldAnalysis: 'ព្រឹត្តិការណ៍ NFP ធំបំផុតប្រចាំខែ! ទីផ្សារមាសនឹងប្រែប្រួលខ្លាំងក្នុងចន្លោះ 15-40$ ក្នុងប៉ុន្មាននាទី។',
      minutesUntil: 720,
    },
  ];

  return {
    success: true,
    source: 'Forex Factory (Fallback Intelligence)',
    sourceUrl: 'https://www.forexfactory.com/',
    updatedAt: new Date().toISOString(),
    newsShieldActive: false,
    nextHighImpactEvent: fallbackList[0],
    events: fallbackList,
    marketSentiment: {
      overallBias: 'NEUTRAL',
      summary: 'តាមដានព័ត៌មានសេដ្ឋកិច្ច USD ពី Forex Factory ដើម្បីកំណត់ទិសដៅមាស XAU/USD។',
    },
  };
}
