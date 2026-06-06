/**
 * BottomPanel.jsx  —  Geospatial summary strip
 *
 * Desktop: CSS grid centre column, row 2 — 4-column card layout.
 * Mobile:  position:fixed top strip (index.css .bottom-panel rule).
 *          .stat-grid collapses to repeat(2,1fr) via media query.
 */

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { GlassPanel, SectionHeading } from './ui';

function StatCard({ label, value, unit, color }) {
  return (
    <div style={{
      background:       'var(--surface)',
      border:           '1px solid var(--border)',
      borderRadius:     10,
      padding:          '10px 12px',
      display:          'grid',
      gridTemplateRows: 'auto 1fr auto',
      height:           '100%',
      minHeight:        90,
    }}>
      {/* Label */}
      <div style={{
        fontSize: 10, fontWeight: 500,
        color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '1px',
        marginBottom: 6,
      }}>
        {label}
      </div>

      {/* Value — clamp font for long region names */}
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   'clamp(11px, 1.1vw, 20px)',
          fontWeight: 500,
          color:      color ?? 'var(--text-primary)',
          lineHeight: 1.1,
        }}>
          {value}
        </span>
      </div>

      {/* Unit */}
      {unit && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{unit}</div>
      )}
    </div>
  );
}

export default function BottomPanel() {
  const { kpis, loading } = useAppContext();
  const { maxFrp, minFrpVal, avgBright, topRegion } = kpis;

  const regionLabel = topRegion ? `${topRegion[0]} (${topRegion[1]})` : '—';

  return (
    /* className="bottom-panel" → mobile CSS pins this to top of viewport */
    <GlassPanel
      className="bottom-panel"
      style={{ gridColumn: 2, gridRow: 2, animation: 'fadeInPanel 0.5s ease-out 0.3s both' }}
    >
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeading>Geospatial Activity Summary</SectionHeading>

        {/*
          className="stat-grid"
          Desktop inline style: 4-column.
          Mobile override in index.css: repeat(2, 1fr)
        */}
        <div
          className="stat-grid"
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap:                 8,
            height:              'calc(100% - 28px)',
          }}
        >
          <StatCard label="Peak FRP"       value={loading ? '…' : maxFrp.toFixed(1)}    unit="MW"     color="var(--high)"        />
          <StatCard label="Min FRP"        value={loading ? '…' : minFrpVal.toFixed(1)} unit="MW"     color="var(--low)"         />
          <StatCard label="Avg Brightness" value={loading ? '…' : avgBright.toFixed(0)} unit="Kelvin" color="var(--mod)"         />
          <StatCard label="Hottest Region" value={loading ? '…' : regionLabel}                        color="var(--accent-cyan)" />
        </div>
      </div>
    </GlassPanel>
  );
}