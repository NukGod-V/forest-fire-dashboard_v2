/**
 * MapEngine.jsx
 *
 * BLACK-BOX map wrapper.  Incorporates the engineer's controlled-viewState
 * approach (smooth zoom/reset animations) from the updated App.jsx.
 *
 * Mobile change: the controls wrapper gains className="map-controls".
 * The CSS media query in index.css moves it from right:380px/top:20px
 * to right:16px/bottom:120px on screens ≤ 768px.
 *
 * ⚠️  controller={true} stays — deck.gl merges external viewState changes
 *     smoothly; removing it causes the lag bug.
 */

import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useAppContext } from '../context/AppContext';

// ── Basemap styles ────────────────────────────────────────────────────────────
const MAP_THEMES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  satellite: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
      },
    },
    layers: [{ id: 'satellite', type: 'raster', source: 'esri-satellite' }],
  },
};

// ── Initial camera state ──────────────────────────────────────────────────────
const INITIAL_VIEW_STATE = {
  longitude: 78.9629,
  latitude:  20.5937,
  zoom:      4.5,
  pitch:     45,
  bearing:   0,
};

// ── Shared control button style (reads CSS vars → theme-aware) ────────────────
const controlStyle = {
  background:     'var(--panel-bg)',
  color:          'var(--text-primary)',
  border:         '1px solid var(--border)',
  borderRadius:   '8px',
  width:          '40px',
  height:         '40px',
  cursor:         'pointer',
  fontSize:       '22px',
  fontWeight:     'bold',
  backdropFilter: 'var(--blur)',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  transition:     'all 0.3s ease',
};

export default function MapEngine() {
  // Shared app state from context
  const { theme, viewMode, filteredData } = useAppContext();

  // Camera state owned here for smooth programmatic zoom / reset
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const handleZoom = (delta) => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(1, Math.min(20, prev.zoom + delta)),
      transitionDuration: 300,
    }));
  };

  const handleReset = () => {
    setViewState({ ...INITIAL_VIEW_STATE, transitionDuration: 500 });
  };

  // ── Layers ────────────────────────────────────────────────────────────────
  const scatterLayer = new ScatterplotLayer({
    id:              'nasa-scatter',
    data:            filteredData,
    pickable:        true,
    opacity:         0.8,
    radiusScale:     1000,
    radiusMinPixels: 2,
    radiusMaxPixels: 10,
    getPosition:     (d) => [d.longitude, d.latitude],
    getFillColor:    (d) => {
      if (d.brightness >= 340) return [255, 0, 0];
      if (d.brightness >= 320) return [255, 140, 0];
      return [255, 215, 0];
    },
  });

  const hexLayer = new HexagonLayer({
    id:             'nasa-hex',
    data:           filteredData,
    pickable:       true,
    extruded:       true,
    radius:         15000,
    elevationScale: 50,
    getPosition:    (d) => [d.longitude, d.latitude],
    colorRange: [
      [255, 255, 178],
      [254, 204,  92],
      [253, 141,  60],
      [240,  59,  32],
      [189,   0,  38],
    ],
  });

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const getTooltip = ({ object }) => {
    if (!object) return null;
    if (object.points)    return `Fires in tactical sector: ${object.points.length}`;
    if (object.brightness) return `Brightness: ${object.brightness} K\nSatellite: ${object.satellite}`;
    return null;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>

      {/* Controlled DeckGL — smooth camera transitions via viewState */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}                    /* ← must stay; prevents lag */
        layers={viewMode === '3d-hex' ? [hexLayer] : [scatterLayer]}
        getTooltip={getTooltip}
      >
        <Map mapStyle={MAP_THEMES[theme]} />
      </DeckGL>

      {/*
        Map controls wrapper.
        Desktop:  right:380px  top:20px   (clears the 360px StatsPanel + gap)
        Mobile:   right:16px   bottom:120px  (CSS .map-controls override in index.css)
      */}
      <div
        className="map-controls"
        style={{
          position:      'absolute',
          right:         '380px',
          top:           '20px',
          display:       'flex',
          flexDirection: 'column',
          gap:           '8px',
          zIndex:        10,
        }}
      >
        <button onClick={() => handleZoom(1)}  style={controlStyle} aria-label="Zoom in">+</button>
        <button onClick={() => handleZoom(-1)} style={controlStyle} aria-label="Zoom out">−</button>
        <button onClick={handleReset}          style={{ ...controlStyle, fontSize: '16px' }} aria-label="Reset view">⌂</button>
      </div>

    </div>
  );
}