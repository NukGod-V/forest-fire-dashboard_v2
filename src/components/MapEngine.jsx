/**
 * MapEngine.jsx
 *
 * BLACK-BOX map wrapper.  This file is a direct port of the engineer's
 * App.jsx, with exactly two changes:
 *   1. State (theme, viewMode, fireData) is READ from AppContext instead
 *      of being owned here — so the UI sidebars can toggle them.
 *   2. The original inline control buttons are REMOVED (the sidebars own them).
 *
 * ⚠️  Do NOT add viewport/camera useState here — deck.gl's controller={true}
 *     manages its own state to avoid the lag bug.
 */

import React from 'react';
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

// ── Initial camera — deck.gl owns this after mount ───────────────────────────
const INITIAL_VIEW_STATE = {
  longitude: 78.9629,
  latitude:  20.5937,
  zoom:      4.5,
  pitch:     45,
  bearing:   0,
};

export default function MapEngine() {
  // Read shared state from context — never own it here
  const { theme, viewMode, filteredData } = useAppContext();

  // ── Layers (verbatim from engineer's App.jsx) ─────────────────────────────
  const scatterLayer = new ScatterplotLayer({
    id: 'nasa-scatter',
    data: filteredData,
    pickable: true,
    opacity: 0.8,
    radiusScale: 1000,
    radiusMinPixels: 2,
    radiusMaxPixels: 10,
    getPosition: (d) => [d.longitude, d.latitude],
    getFillColor: (d) => {
      if (d.brightness >= 340) return [255, 0, 0];
      if (d.brightness >= 320) return [255, 140, 0];
      return [255, 215, 0];
    },
  });

  const hexLayer = new HexagonLayer({
    id: 'nasa-hex',
    data: filteredData,
    pickable: true,
    extruded: true,
    radius: 15000,
    elevationScale: 50,
    getPosition: (d) => [d.longitude, d.latitude],
    colorRange: [
      [255, 255, 178],
      [254, 204, 92],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38],
    ],
  });

  // ── Tooltip (verbatim from engineer's App.jsx) ────────────────────────────
  const getTooltip = ({ object }) => {
    if (!object) return null;
    if (object.points) {
      return `Fires in this 15 km sector: ${object.points.length}`;
    }
    if (object.brightness) {
      return `Brightness: ${object.brightness} K\nSatellite: ${object.satellite}`;
    }
    return null;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}                          /* ← never remove; prevents lag */
        layers={viewMode === '3d-hex' ? [hexLayer] : [scatterLayer]}
        getTooltip={getTooltip}
      >
        <Map mapStyle={MAP_THEMES[theme]} />
      </DeckGL>
    </div>
  );
}