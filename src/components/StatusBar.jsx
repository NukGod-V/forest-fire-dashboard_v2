/**
 * StatusBar.jsx  —  Fixed bottom status strip
 *
 * Mobile: secondary items get className="status-bar-hide-mobile"
 * so they vanish on narrow screens without removing the elements.
 * The three status dots and the clock always stay visible.
 */

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

function StatusDot({ color, pulse }) {
  const colors = {
    green: { bg: '#22c55e',    shadow: 'rgba(34,197,94,0.5)' },
    amber: { bg: 'var(--mod)', shadow: 'var(--mod-glow)'     },
    red:   { bg: 'var(--high)',shadow: 'var(--high-glow)'    },
  };
  const c = colors[color] ?? colors.green;
  return (
    <span style={{
      display:      'inline-block',
      width:        6, height: 6,
      borderRadius: '50%',
      background:   c.bg,
      boxShadow:    `0 0 6px ${c.shadow}`,
      animation:    pulse ? 'blink 1.4s ease-in-out infinite' : 'none',
      marginRight:  4,
    }} />
  );
}

export default function StatusBar() {
  const { fireData, filteredData, loading, error } = useAppContext();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(
      new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const base = {
    display:    'flex',
    alignItems: 'center',
    fontSize:   10,
    fontFamily: 'var(--font-mono)',
    color:      'var(--text-muted)',
    gap:        4,
  };

  return (
    /* className="status-bar" — mobile tightens padding/gap */
    <div
      className="status-bar"
      style={{
        position:       'fixed',
        bottom:         0,
        left:           0,
        right:          0,
        zIndex:         20,
        height:         28,
        background:     'var(--statusbar-bg)',
        backdropFilter: 'blur(8px)',
        borderTop:      '1px solid var(--border)',
        display:        'flex',
        alignItems:     'center',
        padding:        '0 16px',
        gap:            24,
        /* StatusBar must always be tappable */
        pointerEvents:  'all',
      }}
    >
      {/* ── Always visible ── */}
      <span style={base}><StatusDot color={error ? 'red' : 'green'} /> Azure API</span>
      <span style={base}><StatusDot color={loading ? 'amber' : 'green'} /> FIRMS</span>
      <span style={base}><StatusDot color="red" pulse /> Alerts</span>

      {/* ── Hidden on mobile ── */}
      <span className="status-bar-hide-mobile" style={base}>Poll 30s</span>
      <span className="status-bar-hide-mobile" style={base}>
        Points:&nbsp;<span style={{ color: 'var(--text-secondary)' }}>{fireData.length}</span>
      </span>
      <span className="status-bar-hide-mobile" style={base}>
        Filtered:&nbsp;<span style={{ color: 'var(--text-secondary)' }}>{filteredData.length}</span>
      </span>

      {/* ── Error: always visible if present ── */}
      {error && (
        <span style={{ ...base, color: 'var(--high)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Err: {error}
        </span>
      )}

      {/* ── Clock: right-aligned, always visible ── */}
      <span style={{ ...base, marginLeft: 'auto', color: 'var(--text-secondary)' }}>
        {clock}
      </span>
    </div>
  );
}