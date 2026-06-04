/**
 * App.jsx  —  Root application shell
 *
 * Responsibility:
 *  • Renders the <AppProvider> context wrapper
 *  • Composes the full-screen layout: MapEngine (z-0) + UI overlay (z-10)
 *  • Does NOT own any state — all state lives in AppContext
 *
 * Layout grid (identical to the original HTML, now in CSS-in-JS):
 *
 *   ┌─────────────┬──────────────────┬─────────────┐  ← row 1 (flex-1)
 *   │  Sidebar    │   (map shows     │  StatsPanel │
 *   │  (left)     │    through)      │  (right)    │
 *   ├─────────────┼──────────────────┼─────────────┤  ← row 2 (280px)
 *   │  Sidebar    │   BottomPanel    │  StatsPanel │
 *   │  (cont.)    │   (center)       │  (cont.)    │
 *   └─────────────┴──────────────────┴─────────────┘
 *   └──────────────── StatusBar (28px, fixed) ──────┘
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import MapEngine   from './components/MapEngine';
import Sidebar     from './components/Sidebar';
import StatsPanel  from './components/StatsPanel';
import BottomPanel from './components/BottomPanel';
import StatusBar   from './components/StatusBar';

// ── Layout shell ──────────────────────────────────────────────────────────────
function Shell() {
  return (
    <>
      {/* Map — absolute, fills viewport, behind everything */}
      <MapEngine />

      {/* UI overlay — pointer-events disabled on the grid itself so clicks
          fall through to the map; re-enabled panel by panel inside each component */}
      <div style={{
        position:       'fixed',
        inset:          '0 0 28px 0',   /* leave room for StatusBar */
        zIndex:         10,
        display:        'grid',
        gridTemplateColumns: '320px 1fr 360px',
        gridTemplateRows:    '1fr 260px',
        gap:            12,
        padding:        12,
        pointerEvents:  'none',
      }}>
        <Sidebar />
        {/* Centre column row 1 is transparent — map shows through */}
        <div style={{ gridColumn: 2, gridRow: 1 }} />
        <StatsPanel />
        {/* Centre column row 2 */}
        <BottomPanel />
      </div>

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