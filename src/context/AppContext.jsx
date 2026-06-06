/**
 * AppContext.jsx
 *
 * Single global store for the entire application.
 * Provides:
 *   - theme / setTheme          ('dark' | 'satellite')
 *   - viewMode / setViewMode    ('scatter' | '3d-hex')
 *   - fireData                  (raw array from Azure API)
 *   - filteredData              (after sidebar filters)
 *   - loading / error
 *   - filters / setFilters      (risk, minFrp, dateFrom, dateTo)
 *   - lastRefresh               (Date object, updated on each poll)
 *
 * The map engine reads `theme` and `viewMode`.
 * The UI panels read everything else.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { applyTheme } from '../utils/theme';

const AppContext = createContext(null);

const POLL_INTERVAL_MS = 30_000;

// 1. ADDED dayRange to the default filters!
const DEFAULT_FILTERS = {
  risk: 'all',
  minFrp: 0,
  dayRange: 1,       // Added this!
  dateFrom: '',
  dateTo: '',
};

export function brightnessToRisk(brightness) {
  if (brightness >= 340) return 'High';
  if (brightness >= 320) return 'Moderate';
  return 'Low';
}

// Fast spatial approximation for Indian States
export function getIndianState(lat, lon) {
  if (lat >= 28) return 'North India (PB/HR/UK)';
  if (lat < 28 && lat >= 21 && lon < 80) return 'West India (MH/GJ)';
  if (lat < 28 && lat >= 21 && lon >= 80) return 'East India (OD/WB/JH)';
  if (lat < 21 && lat >= 15) return 'Deccan (TG/AP/MH)';
  if (lat < 15) return 'South India (KA/TN/KL)';
  return 'India';
}

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const setTheme = useCallback((t) => {
    setThemeState(t);
    applyTheme(t);
  }, []);

  useEffect(() => { applyTheme('dark'); }, []);

  const [viewMode, setViewMode] = useState('scatter');

  const [fireData, setFireData] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const setFilters = useCallback((patch) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  // 2. MOVED fetchData inside so it can read your filter state dynamically
  const fetchData = useCallback(() => {
    const getFallbackDate = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1); // T-1 offset
      return yesterday.toISOString().split('T')[0];
    };

    // If dateTo isn't set, default to yesterday
    const dateParam = filters.dateTo || getFallbackDate();
    const rangeParam = filters.dayRange || 1;

    // 3. DYNAMIC URL
    const API_URL = `https://nukgod-forest-api-c3amfyaxdkh8a3dw.eastasia-01.azurewebsites.net/api/FetchNASAData?date=${dateParam}&day_range=${rangeParam}`;

    setLoading(true);

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const raw = json.data ?? [];
        const enriched = raw.map((d) => ({
          ...d,
          risk_level: brightnessToRisk(d.brightness),
          frp: d.frp ?? d.bright_t31 ?? 0,
        }));
        setFireData(enriched);
        setLastRefresh(new Date());
        setLoading(false);
        console.log("RAW DATA FROM AZURE:", enriched);
      })
      .catch((err) => {
        console.error('[AppContext] Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [filters.dayRange, filters.dateTo]); // 4. Tells React to update if these change

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return fireData.filter((d) => {
      if (filters.risk !== 'all' && d.risk_level !== filters.risk) return false;
      if (d.frp < filters.minFrp) return false;
      if (filters.dateFrom && new Date(d.acq_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo   && new Date(d.acq_date) > new Date(filters.dateTo + 'T23:59:59Z')) return false;
      return true;
    });
  }, [fireData, filters]);

  const kpis = useMemo(() => {
    const total = filteredData.length;
    const high  = filteredData.filter((d) => d.risk_level === 'High').length;
    const mod   = filteredData.filter((d) => d.risk_level === 'Moderate').length;
    const low   = filteredData.filter((d) => d.risk_level === 'Low').length;
    const avgFrp = total
      ? filteredData.reduce((s, d) => s + d.frp, 0) / total
      : 0;
    const maxFrp = total ? Math.max(...filteredData.map((d) => d.frp)) : 0;
    const minFrpVal = total ? Math.min(...filteredData.map((d) => d.frp)) : 0;
    const avgBright = total
      ? filteredData.reduce((s, d) => s + (d.brightness ?? 0), 0) / total
      : 0;

    const regionMap = {};
    filteredData.forEach((d) => {
      // Use our new spatial math function!
      const r = getIndianState(d.latitude, d.longitude);
      regionMap[r] = (regionMap[r] ?? 0) + 1;
    });
    const topRegion = Object.entries(regionMap).sort((a, b) => b[1] - a[1])[0];

    return { total, high, mod, low, avgFrp, maxFrp, minFrpVal, avgBright, topRegion };
  }, [filteredData]);

  const value = {
    theme, setTheme,
    viewMode, setViewMode,
    fireData, filteredData, loading, error, lastRefresh,
    refetch: fetchData,
    filters, setFilters,
    kpis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}