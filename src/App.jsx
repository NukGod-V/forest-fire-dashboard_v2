/**
 * App.jsx  —  Root application shell
 *
 * Desktop layout (≥769px):
 *   3-column CSS grid:  Sidebar (320px) | map centre | StatsPanel (360px)
 *   Row 2: BottomPanel spans the centre column
 *
 * Mobile layout (≤768px):  driven by index.css @media block
 *   • BottomPanel  → position:fixed top strip (always visible, z-25)
 *   • Sidebar      → position:fixed slide-up drawer (z-30), default off-screen
 *   • StatsPanel   → position:fixed slide-up drawer (z-30), default off-screen
 *   • FAB row      → two pill buttons fixed above StatusBar
 *   • Scrim        → semi-opaque overlay behind open drawer; closes on tap
 *
 * State added here:
 *   mobilePanel: null | 'sidebar' | 'stats'
 *     — controls which drawer is open (or none)
 *     — passed as mobileOpen prop to Sidebar and StatsPanel
 *     — drives the scrim's visibility and pointer-events
 *
 * Everything else (theme, viewMode, fireData, filters) still lives
 * in AppContext as before.  This file owns ONLY the drawer toggle.
 *
 * THE CLICK-THROUGH BUG:
 *   The grid wrapper has pointer-events:none so map stays interactive.
 *   On mobile, drawers are position:fixed (outside grid flow visually)
 *   but still inherit pointer-events:none from their DOM parent.
 *   Fix is three-layered:
 *     1. .sidebar-panel.mobile-open  sets pointer-events:all !important
 *     2. .sidebar-panel.mobile-open * sets pointer-events:auto !important
 *     3. The scrim div lives OUTSIDE the grid wrapper so it never
 *        inherits pointer-events:none from it.
 */

import React, { useState, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import MapEngine   from './components/MapEngine';
import Sidebar     from './components/Sidebar';
import StatsPanel  from './components/StatsPanel';
import BottomPanel from './components/BottomPanel';
import StatusBar   from './components/StatusBar';

// ── Shell ─────────────────────────────────────────────────────────────────────
function Shell() {
  // null | 'sidebar' | 'stats'
  const [mobilePanel, setMobilePanel] = useState(null);

  const togglePanel = useCallback((name) => {
    setMobilePanel((prev) => (prev === name ? null : name));
  }, []);

  // Close on scrim tap or programmatically
  const closePanel = useCallback(() => setMobilePanel(null), []);

  return (
    <>
      {/* ── 1. Map — absolute, fills viewport, z-0 ───────────────────────── */}
      <MapEngine />

      {/*
        ── 2. Scrim ────────────────────────────────────────────────────────
        Placed here — OUTSIDE the grid wrapper — so it is never a child of
        the pointer-events:none div.  Its own pointer-events are toggled
        inline: 'all' when a panel is open so tapping it closes the drawer,
        'none' otherwise so the map stays touchable.
      */}
      {/*
        Scrim only covers the TOP portion of the screen (above the drawer).
        This means it can never overlap the open panel, so there is zero
        chance of the scrim's handler firing when the user taps panel content.
        bottom is set to 72vh (the max-height of the drawer) + 28px StatusBar.
        We use onPointerDown (fires before onClick, more reliable on touch).
      */}
      <div
        className="mobile-scrim"
        style={{
          opacity:       mobilePanel ? 1 : 0,
          pointerEvents: mobilePanel ? 'all' : 'none',
          transition:    'opacity 0.25s ease',
          bottom:        'calc(72vh + 28px)',   /* never overlaps the open drawer */
        }}
        onPointerDown={closePanel}
        aria-hidden="true"
      />

      {/*
        ── 3. Desktop grid overlay ──────────────────────────────────────────
        pointer-events:none on this wrapper so the map below stays
        fully interactive.  Glass panels re-enable via .glass-panel.
        On mobile the CSS switches this to display:block so the drawers
        (now position:fixed) are positioned relative to the viewport,
        not the grid.
      */}
      <div
        className="app-shell"
        style={{
          position:            'fixed',
          inset:               '0 0 28px 0',
          zIndex:              10,
          display:             'grid',
          gridTemplateColumns: '320px 1fr 360px',
          gridTemplateRows:    '1fr 260px',
          gap:                 12,
          padding:             12,
          pointerEvents:       'none',
        }}
      >
        {/* Left panel — mobile: slide-up drawer */}
        <Sidebar mobileOpen={mobilePanel === 'sidebar'} />

        {/* Centre col row 1: transparent, map shows through */}
        <div style={{ gridColumn: 2, gridRow: 1 }} />

        {/* Right panel — mobile: slide-up drawer */}
        <StatsPanel mobileOpen={mobilePanel === 'stats'} />

        {/* Centre col row 2: bottom summary strip */}
        <BottomPanel />
      </div>

      {/*
        ── 4. Mobile FAB row ────────────────────────────────────────────────
        Outside the grid wrapper so it is never affected by
        pointer-events:none.  Hidden on desktop via display:none in CSS.
      */}
      <div className="mobile-fab-row" role="toolbar" aria-label="Panel toggles">
        <button
          className={`mobile-fab${mobilePanel === 'sidebar' ? ' is-active' : ''}`}
          onClick={() => togglePanel('sidebar')}
          aria-pressed={mobilePanel === 'sidebar'}
          aria-label="Toggle Filters panel"
        >
          <span className="fab-icon">⚙</span>
          Filters
        </button>

        <button
          className={`mobile-fab${mobilePanel === 'stats' ? ' is-active' : ''}`}
          onClick={() => togglePanel('stats')}
          aria-pressed={mobilePanel === 'stats'}
          aria-label="Toggle Analytics panel"
        >
          <span className="fab-icon">📊</span>
          Analytics
        </button>
      </div>

      {/* ── 5. Status bar ────────────────────────────────────────────────── */}
      <StatusBar />
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}