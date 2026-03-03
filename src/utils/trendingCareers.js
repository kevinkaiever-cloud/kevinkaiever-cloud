import { CAREER_DB } from "../data/careers";
import { generateCareerSeries } from "../engine/careerTrend";

function computeCareerTrend(c) {
  const s = generateCareerSeries(c.career_name);
  const last = s[s.length - 1];
  const prev = s[Math.max(0, s.length - 4)];
  return {
    ...c,
    salary: last?.salary_median ?? 0,
    hiring: last?.hiring_index ?? 0,
    change: (last?.hiring_index ?? 0) - (prev?.hiring_index ?? 0),
  };
}

// Cache the computed results (pure function of static data)
let _cache = null;
function getAllTrends() {
  if (!_cache) {
    _cache = CAREER_DB.map(computeCareerTrend);
  }
  return _cache;
}

export function getTrendingCareers(count = 6) {
  return getAllTrends()
    .slice()
    .sort((a, b) => b.change - a.change)
    .slice(0, count);
}

export function getDecliningCareers(count = 4) {
  return getAllTrends()
    .slice()
    .sort((a, b) => a.change - b.change)
    .slice(0, count);
}
