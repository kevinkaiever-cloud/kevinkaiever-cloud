import { useEffect, useMemo, useState } from "react";
import { generateCareerSeries, generateIndustrySeries } from "../engine/careerTrend";
import { generateCompanySeries } from "../engine/companyTrend";
import { normalizeCareerSeries, filterByTimeRange } from "../utils/seriesUtils";
import { TIME_RANGES } from "../utils/constants";

// ─── Smart API detection: skip fetch after first failure ────────
let _apiStatus = null; // null = untested, true/false = result

async function tryFetch(url) {
  if (_apiStatus === false) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) { _apiStatus = false; return null; }
    const payload = await res.json();
    if (payload?.series?.length) { _apiStatus = true; return payload; }
    return null;
  } catch {
    _apiStatus = false;
    return null;
  }
}

// ─── Career data hook ───────────────────────────────────────────
export function useCareerData(careerName) {
  const [series, setSeries] = useState([]);
  const [source, setSource] = useState("simulated");
  const [loading, setLoading] = useState(false);

  const simulated = useMemo(
    () => generateCareerSeries(careerName),
    [careerName]
  );

  useEffect(() => {
    if (!careerName) return;
    let cancelled = false;
    setLoading(true);
    tryFetch(`/api/career/${encodeURIComponent(careerName)}`)
      .then((payload) => {
        if (cancelled) return;
        if (payload) {
          setSeries(payload.series);
          setSource(payload.source || "api");
        } else {
          setSeries(simulated);
          setSource("simulated");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [careerName, simulated]);

  const normalized = useMemo(() => normalizeCareerSeries(series), [series]);

  return { series, normalized, simulated, source, loading };
}

// ─── Filtered career series by time range ───────────────────────
export function useFilteredSeries(normalized, timeRange) {
  return useMemo(
    () => filterByTimeRange(normalized, timeRange, TIME_RANGES),
    [normalized, timeRange]
  );
}

// ─── Industry data hook ─────────────────────────────────────────
export function useIndustryData(industryName) {
  const [series, setSeries] = useState([]);
  const [source, setSource] = useState("simulated");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!industryName) return;
    let cancelled = false;
    setLoading(true);
    tryFetch(`/api/industry/${encodeURIComponent(industryName)}`)
      .then((payload) => {
        if (cancelled) return;
        if (payload) {
          setSeries(payload.series);
          setSource(payload.source || "api");
        } else {
          setSeries(generateIndustrySeries(industryName));
          setSource("simulated");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [industryName]);

  return { series, source, loading };
}

// ─── Company data hook ──────────────────────────────────────────
export function useCompanyData(companyName) {
  const [series, setSeries] = useState([]);
  const [source, setSource] = useState("simulated");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyName) return;
    let cancelled = false;
    setLoading(true);
    tryFetch(`/api/company/${encodeURIComponent(companyName)}`)
      .then((payload) => {
        if (cancelled) return;
        if (payload) {
          setSeries(payload.series);
          setSource(payload.source || "api");
        } else {
          setSeries(generateCompanySeries(companyName));
          setSource("simulated");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [companyName]);

  return { series, source, loading };
}
