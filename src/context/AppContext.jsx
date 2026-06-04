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
  useRef,
} from 'react';
import { applyTheme } from '../utils/theme';

const AppContext = createContext(null);

const API_URL =
  'https://nukgod-forest-api-c3amfyaxdkh8a3dw.eastasia-01.azurewebsites.net/api/FetchNASAData?date=2026-06-04&day_range=1';

const POLL_INTERVAL_MS = 30_000;

const DEFAULT_FILTERS = {
  risk: 'all',       // 'all' | 'High' | 'Moderate' | 'Low'
  minFrp: 0,
  dateFrom: '',
  dateTo: '',
};

/** Maps NASA brightness to a human-readable risk label (mirrors original scatter layer logic). */
export function brightnessToRisk(brightness) {
  if (brightness >= 340) return 'High';
  if (brightness >= 320) return 'Moderate';
  return 'Low';
}

export function AppProvider({ children }) {
  // ── Theme ─────────────────────────────────────────────────
  const [theme, setThemeState] = useState('dark');
  const setTheme = useCallback((t) => {
    setThemeState(t);
    applyTheme(t);
  }, []);

  // Apply initial theme tokens on mount
  useEffect(() => { applyTheme('dark'); }, []);

  // ── Map view mode ─────────────────────────────────────────
  const [viewMode, setViewMode] = useState('3d-hex');

  // ── Raw fire data from Azure ───────────────────────────────
  const [fireData, setFireData] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const raw = json.data ?? [];
        // Enrich with derived risk_level so UI panels don't repeat the logic
        const enriched = raw.map((d) => ({
          ...d,
          risk_level: brightnessToRisk(d.brightness),
          frp: d.frp ?? d.bright_t31 ?? 0,
        }));
        setFireData(enriched);
        setLastRefresh(new Date());
        setLoading(false);
      })
      .catch((err) => {
        console.error('[AppContext] Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  // ── Filters ───────────────────────────────────────────────
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);

  const setFilters = useCallback((patch) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Derived: filtered data ────────────────────────────────
  const filteredData = useMemo(() => {
    return fireData.filter((d) => {
      if (filters.risk !== 'all' && d.risk_level !== filters.risk) return false;
      if (d.frp < filters.minFrp) return false;
      if (filters.dateFrom && new Date(d.acq_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo   && new Date(d.acq_date) > new Date(filters.dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [fireData, filters]);

  // ── KPI derivations (memoised) ────────────────────────────
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

    // Top region by count
    const regionMap = {};
    filteredData.forEach((d) => {
      const r = d.country_id ?? d.region ?? 'Unknown';
      regionMap[r] = (regionMap[r] ?? 0) + 1;
    });
    const topRegion = Object.entries(regionMap).sort((a, b) => b[1] - a[1])[0];

    return { total, high, mod, low, avgFrp, maxFrp, minFrpVal, avgBright, topRegion };
  }, [filteredData]);

  const value = {
    // Theme
    theme, setTheme,
    // Map
    viewMode, setViewMode,
    // Data
    fireData, filteredData, loading, error, lastRefresh,
    refetch: fetchData,
    // Filters
    filters, setFilters,
    // Derived
    kpis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Convenience hook — throws if used outside <AppProvider>. */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}