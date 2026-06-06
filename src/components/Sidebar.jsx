/**
 * Sidebar.jsx  —  Left floating control panel
 *
 * Sections:
 *  • Logo / header / LIVE badge
 *  • KPI cards  (total, high-risk, avg FRP)
 *  • Risk distribution progress bars
 *  • Map layer toggle  (Scatter / 3D Hex)
 *  • Map theme toggle  (Dark / Satellite)
 *  • Filters  (risk dropdown, FRP slider, date range)
 *  • System status rows
 */

import React from 'react';
import { useAppContext } from '../context/AppContext';
import {
  GlassPanel, SectionHeading, KpiCard,
  ProgressBar, Divider, LayerToggle,
  FilterSelect, FilterSlider, FilterDate,
} from './ui';

// ── Tiny atoms ────────────────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <div style={{
      marginLeft:    'auto',
      display:       'flex',
      alignItems:    'center',
      gap:           5,
      background:    'rgba(255,0,60,0.12)',
      border:        '1px solid rgba(255,0,60,0.3)',
      borderRadius:  100,
      padding:       '3px 9px',
      fontSize:      10,
      fontWeight:    600,
      color:         'var(--high)',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--high)',
        animation: 'blink 1.4s ease-in-out infinite',
        display: 'inline-block',
      }} />
      Live
    </div>
  );
}

function StatusRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', color: valueColor ?? 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Sidebar({ mobileOpen = false }) {
  const {
    theme, setTheme,
    viewMode, setViewMode,
    filters, setFilters,
    kpis, loading, lastRefresh,
    fireData, filteredData,
  } = useAppContext();

  const { total, high, mod, low, avgFrp } = kpis;

  const hp = total ? Math.round(high / total * 100) : 0;
  const mp = total ? Math.round(mod  / total * 100) : 0;
  const lp = total ? Math.round(low  / total * 100) : 0;

  return (
    <GlassPanel
      className={`sidebar-panel${mobileOpen ? ' mobile-open' : ''}`}
      style={{ gridColumn: 1, gridRow: '1 / -1', animation: 'fadeInPanel 0.5s ease-out 0.1s both' }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          {/* Flame logo */}
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #FF003C, #FF8A00)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
            boxShadow: '0 0 20px var(--high-glow), 0 2px 8px rgba(0,0,0,0.4)',
            animation: 'pulseLogo 3s ease-in-out infinite',
          }}>
            🔥
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
              Wildfire AI Monitor
            </div>
            <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              NASA FIRMS · XGBoost v2.4
            </div>
          </div>
          <LiveBadge />
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="panel-scroll-body" style={{ flex: 1, overflowY: 'auto', padding: 18, scrollbarWidth: 'thin', scrollbarColor: 'rgba(128,128,128,0.15) transparent' }}>

        {/* KPIs */}
        <SectionHeading>Situation Overview</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <KpiCard
            label="Active Fires"
            value={loading ? '…' : total}
            delta={`of ${fireData.length} total`}
            deltaUp={filteredData.length < fireData.length}
          />
          <KpiCard
            label="High Risk"
            value={loading ? '…' : high}
            color="var(--high)"
            delta="Critical"
            deltaUp
          />
          <KpiCard
            label="Avg FRP"
            value={loading ? '…' : avgFrp.toFixed(1)}
            unit="MW"
            color="var(--mod)"
            style={{ gridColumn: '1 / -1' }}
          />
        </div>

        {/* Risk distribution */}
        <SectionHeading>Risk Distribution</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'High',     pct: hp, count: high, color: 'linear-gradient(90deg, var(--high), #FF4D6A)' },
            { label: 'Moderate', pct: mp, count: mod,  color: 'linear-gradient(90deg, var(--mod), #FFAD4D)' },
            { label: 'Low',      pct: lp, count: low,  color: 'linear-gradient(90deg, var(--low), #FFE566)' },
          ].map(({ label, pct, count, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: label === 'High' ? 'var(--high)' : label === 'Moderate' ? 'var(--mod)' : 'var(--low)' }}>
                  ● {label}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {count} ({pct}%)
                </span>
              </div>
              <ProgressBar pct={pct} color={color} />
            </div>
          ))}
        </div>

        {/* Map layer toggle */}
        <SectionHeading>Map View</SectionHeading>
        <div style={{ marginBottom: 14 }}>
          <LayerToggle
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'scatter', label: 'Scatter' },
              { value: '3d-hex',  label: '3D Hex'  },
            ]}
          />
        </div>

        {/* Map theme toggle */}
        <SectionHeading>Basemap</SectionHeading>
        <div style={{ marginBottom: 14 }}>
          <LayerToggle
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark',      label: 'Dark'      },
              { value: 'satellite', label: 'Satellite' },
            ]}
          />
        </div>

        {/* Filters */}
        <SectionHeading>Filters</SectionHeading>
        <FilterSelect
          label="Risk Level"
          value={filters.risk}
          onChange={(v) => setFilters({ risk: v })}
          options={[
            { value: 'all',      label: 'All Risk Levels' },
            { value: 'High',     label: 'High Only'       },
            { value: 'Moderate', label: 'Moderate Only'   },
            { value: 'Low',      label: 'Low Only'        },
          ]}
        />

        <FilterSlider
          label="Min FRP"
          value={filters.minFrp}
          min={0} max={500} step={5}
          unit=" MW"
          onChange={(v) => setFilters({ minFrp: v })}
        />

        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Date Range</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
          <FilterDate label="From" value={filters.dateFrom} onChange={(v) => setFilters({ dateFrom: v })} />
          <FilterDate label="To"   value={filters.dateTo}   onChange={(v) => setFilters({ dateTo:   v })} />
        </div>

        {/* System status */}
        <Divider />
        <SectionHeading>System</SectionHeading>
        <StatusRow label="Azure API"          value="ONLINE"              valueColor="#22c55e" />
        <StatusRow label="NASA FIRMS Feed"    value="SYNCED"              valueColor="#22c55e" />
        <StatusRow label="XGBoost Inference"  value="RUNNING"             valueColor="var(--mod)" />
        <StatusRow label="deck.gl Renderer"   value="GPU ACTIVE"          valueColor="var(--accent-cyan)" />
        <StatusRow
          label="Last Refresh"
          value={lastRefresh ? lastRefresh.toLocaleTimeString() : '—'}
        />
        <StatusRow label="Total points"    value={fireData.length}   />
        <StatusRow label="Filtered points" value={filteredData.length} />
      </div>
    </GlassPanel>
  );
}