/**
 * BottomPanel.jsx  —  Bottom-centre geospatial summary strip
 *
 * Four stat cards: Peak FRP / Min FRP / Avg Brightness / Hottest Region
 */

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { GlassPanel, SectionHeading } from './ui';

function StatCard({ label, value, unit, color }) {
  return (
    <div style={{
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: 10,
      padding:      '10px 12px',

      // 1. THE GRID FIX
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto', // Top, Middle (stretches), Bottom
      height: '100%',
      minHeight: '90px', // Prevents it from collapsing
    }}>

      {/* Top Label */}
      <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
        {label}
      </div>

      {/* Middle Value: Flexbox to force perfect vertical centering */}
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',

          // 2. THE SHRINK FIX: Automatically drops font size for long region names
          fontSize: 'clamp(12px, 1.2vw, 20px)',

          fontWeight: 500,
          color: color ?? 'var(--text-primary)',
          lineHeight: 1.1
        }}>
          {value}
        </span>
      </div>

      {/* Bottom Unit */}
      {unit && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{unit}</div>
      )}

    </div>
  );
}

export default function BottomPanel() {
  const { kpis, loading } = useAppContext();
  const { maxFrp, minFrpVal, avgBright, topRegion } = kpis;

  const regionLabel = topRegion
    ? `${topRegion[0]} (${topRegion[1]})`
    : '—';

  return (
    <GlassPanel style={{ gridColumn: 2, gridRow: 2, animation: 'fadeInPanel 0.5s ease-out 0.3s both' }}>
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <SectionHeading>Geospatial Activity Summary</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, height: 'calc(100% - 28px)' }}>
          <StatCard label="Peak FRP"      value={loading ? '…' : maxFrp.toFixed(1)}   unit="MW"  color="var(--high)" />
          <StatCard label="Min FRP"       value={loading ? '…' : minFrpVal.toFixed(1)} unit="MW"  color="var(--low)" />
          <StatCard label="Avg Brightness" value={loading ? '…' : avgBright.toFixed(0)} unit="Kelvin" color="var(--mod)" />
          <StatCard label="Hottest Region" value={loading ? '…' : regionLabel}          color="var(--accent-cyan)" />
        </div>
      </div>
    </GlassPanel>
  );
}