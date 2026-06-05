/**
 * ui.jsx  —  Shared design primitives
 *
 * Thin wrappers that apply the CSS-variable–driven glassmorphism styles.
 * All colors reference var(--token) so they auto-switch when applyTheme()
 * is called — no per-component theme logic needed.
 */

import React from 'react';

// ── Glass Panel ───────────────────────────────────────────────────────────────
export function GlassPanel({ children, style, className = '' }) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        background:         'var(--panel-bg)',
        backdropFilter:     'var(--blur)',
        WebkitBackdropFilter: 'var(--blur)',
        border:             '1px solid var(--border)',
        borderRadius:       18,
        boxShadow:          'var(--panel-shadow)',
        overflow:           'hidden',
        display:            'flex',
        flexDirection:      'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Section Heading ───────────────────────────────────────────────────────────
export function SectionHeading({ children }) {
  return (
    <div style={{
      fontSize:      10,
      fontWeight:    600,
      color:         'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom:  10,
      display:       'flex',
      alignItems:    'center',
      gap:           8,
    }}>
      {children}
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, unit, color, delta, deltaUp, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '16px',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto', // Top Label, Middle Value, Bottom Unit
      height: '100%', // Forces it to fill parent
      minHeight: '120px', // Prevents it from collapsing
      transition: 'background 0.2s, border-color 0.2s',
      ...style,
    }}>

      {/* 1. Top Label */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </div>

      {/* 2. Middle Value (Forced Centering) */}
      <div style={{
        display: 'flex',
        alignItems: 'center', // Perfect vertical center
        width: '100%',
        overflow: 'hidden'
      }}>
        <span style={{
          fontSize: 'clamp(16px, 1.2vw, 28px)', // Aggressive shrinking for long text
          fontWeight: 'bold',
          color: color || 'var(--text-primary)',
          lineHeight: '1.2'
        }}>
          {value}
        </span>
      </div>

      {/* 3. Bottom Unit */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        {unit}
      </div>
      {delta && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: deltaUp ? 'var(--high)' : '#22c55e' }}>{deltaUp ? '↑' : '↓'}</span>
          {delta}
        </div>
      )}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ pct, color }) {
  return (
    <div style={{ width: '100%', height: 3, background: 'rgba(128,128,128,0.15)', borderRadius: 2, overflow: 'hidden', marginTop: 5 }}>
      <div style={{
        height:     '100%',
        width:      `${Math.min(100, pct)}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />;
}

// ── Layer Toggle ──────────────────────────────────────────────────────────────
export function LayerToggle({ value, onChange, options }) {
  return (
    <div style={{
      display:       'flex',
      gap:           4,
      background:    'var(--surface)',
      borderRadius:  8,
      padding:       3,
    }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex:        1,
            fontSize:    10,
            fontWeight:  600,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            padding:     '5px 8px',
            borderRadius: 6,
            border:      value === opt.value ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            cursor:      'pointer',
            color:       value === opt.value ? 'var(--accent-blue)' : 'var(--text-muted)',
            background:  value === opt.value ? 'rgba(59,130,246,0.15)' : 'transparent',
            fontFamily:  'var(--font-sans)',
            transition:  'all 0.18s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function FilterSelect({ value, onChange, options, label }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width:       '100%',
          background:  'var(--surface)',
          border:      '1px solid var(--border)',
          borderRadius: 8,
          color:       'var(--text-primary)',
          fontFamily:  'var(--font-sans)',
          fontSize:    12,
          padding:     '7px 10px',
          outline:     'none',
          appearance:  'none',
          cursor:      'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#0d1117', color: '#F1F5F9' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Slider ────────────────────────────────────────────────────────────────────
export function FilterSlider({ label, value, min, max, step, onChange, unit }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width:        '100%',
          WebkitAppearance: 'none',
          appearance:   'none',
          height:       3,
          borderRadius: 2,
          outline:      'none',
          cursor:       'pointer',
          background:   `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${pct}%, rgba(128,128,128,0.2) ${pct}%)`,
        }}
      />
    </div>
  );
}

// ── Date Input ────────────────────────────────────────────────────────────────
export function FilterDate({ value, onChange, label }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={label}
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 8,
        color:        'var(--text-secondary)',
        fontFamily:   'var(--font-sans)',
        fontSize:     11,
        padding:      '7px 8px',
        outline:      'none',
        width:        '100%',
        cursor:       'pointer',
      }}
    />
  );
}