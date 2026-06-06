/**
 * StatsPanel.jsx  —  Right floating analytics panel
 *
 * Sections:
 *  • Bar chart  — fire count by risk level  (Chart.js)
 *  • Area/line chart  — FRP trend last 24 h  (Chart.js dual-axis)
 *  • Critical alerts feed  — sorted by FRP, scrollable
 *
 * Chart.js cannot read CSS variables so theme-aware colors are passed
 * explicitly, gated on the `theme` value from context.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { GlassPanel, SectionHeading, Divider } from './ui';

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function ChartLegend({ items }) {
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
      {items.map(({ color, label, dash }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 20, height: 3,
            background: dash ? 'transparent' : color,
            borderBottom: dash ? `2px dashed ${color}` : 'none',
            borderRadius: 1,
          }} />
          {label}
        </div>
      ))}
    </div>
  );
}

function AlertItem({ point }) {
  const time = point.acq_time
    ? `${String(point.acq_time).slice(0, 2)}:${String(point.acq_time).slice(2)}`
    : new Date(point.timestamp ?? Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      background:  'rgba(255,0,60,0.06)',
      border:      '1px solid rgba(255,0,60,0.18)',
      borderLeft:  '3px solid var(--high)',
      borderRadius: 8,
      padding:     '9px 10px',
      flexShrink:  0,
      animation:   'slideIn 0.35s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--high)' }}>
          {point.latitude?.toFixed(3)}°N, {point.longitude?.toFixed(3)}°E
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          {time}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
        {point.country_id ?? 'IN'} · FRP{' '}
        <span style={{ color: 'var(--mod)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          {point.frp?.toFixed(1) ?? '—'} MW
        </span>
        {' · '}Bright: {point.brightness?.toFixed(0) ?? '—'} K
      </div>
    </div>
  );
}

// ── Bar Chart ──────────────────────────────────────────────────────────────────
function BarChart({ high, mod, low, theme }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? '#64748B' : '#94A3B8';

  const buildChart = useCallback(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: ['High', 'Moderate', 'Low'],
        datasets: [{
          label: 'Fire count',
          data:  [high, mod, low],
          backgroundColor: ['rgba(255,0,60,0.8)', 'rgba(255,138,0,0.8)', 'rgba(255,214,0,0.8)'],
          borderColor:     ['#FF003C', '#FF8A00', '#FFD600'],
          borderWidth:      1,
          borderRadius:     4,
          borderSkipped:    false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(8,10,18,0.92)',
            borderColor:     'rgba(255,255,255,0.1)',
            borderWidth:     1,
            titleColor:      '#94A3B8',
            bodyColor:       '#F1F5F9',
            padding:         10,
          },
        },
        scales: {
          x: { grid: { color: gridColor, drawBorder: false }, ticks: { color: tickColor, font: { size: 11 } }, border: { display: false } },
          y: { grid: { color: gridColor, drawBorder: false }, ticks: { color: tickColor, font: { size: 10 }, maxTicksLimit: 4 }, border: { display: false } },
        },
      },
    });
  }, [high, mod, low, gridColor, tickColor]);

  useEffect(() => {
    if (window.Chart) { buildChart(); return; }
    // Chart.js loaded via script tag in index.html
    const id = setInterval(() => { if (window.Chart) { clearInterval(id); buildChart(); } }, 100);
    return () => clearInterval(id);
  }, [buildChart]);

  useEffect(() => () => { chartRef.current?.destroy(); }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 130 }}>
      <canvas ref={canvasRef} role="img" aria-label="Bar chart: fire count by risk level — High, Moderate, Low">
        High: {high}, Moderate: {mod}, Low: {low}
      </canvas>
    </div>
  );
}

// ── Line / Area Chart ─────────────────────────────────────────────────────────
function LineChart({ fireData, theme }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? '#64748B' : '#94A3B8';

  const buildChart = useCallback(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    // Bucket data into 24 hourly slots
    const now = Date.now();
    const buckets = Array.from({ length: 24 }, (_, i) => ({
      label: new Date(now - (23 - i) * 3_600_000).getHours().toString().padStart(2, '0') + ':00',
      frpSum: 0, frpCnt: 0, highCount: 0,
    }));

    fireData.forEach((d) => {
      const ts = d.acq_date ? new Date(`${d.acq_date}T${
        d.acq_time ? String(d.acq_time).padStart(4,'0').replace(/^(\d{2})(\d{2})$/, '$1:$2') : '00:00'
      }:00Z`) : new Date(now);
      const hoursAgo = (now - ts.getTime()) / 3_600_000;
      if (hoursAgo < 0 || hoursAgo > 24) return;
      const idx = 23 - Math.min(23, Math.floor(hoursAgo));
      buckets[idx].frpSum  += d.frp ?? 0;
      buckets[idx].frpCnt  += 1;
      if (d.risk_level === 'High') buckets[idx].highCount += 1;
    });

    const labels   = buckets.map((b) => b.label);
    const frpData  = buckets.map((b) => b.frpCnt ? +(b.frpSum / b.frpCnt).toFixed(1) : 0);
    const highData = buckets.map((b) => b.highCount);

    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label:            'Avg FRP (MW)',
            data:             frpData,
            borderColor:      '#3B82F6',
            backgroundColor:  isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
            fill:             true,
            tension:          0.45,
            pointRadius:      0,
            pointHoverRadius: 4,
            borderWidth:      2,
          },
          {
            label:            'High-Risk Count',
            data:             highData,
            borderColor:      '#FF003C',
            backgroundColor:  isDark ? 'rgba(255,0,60,0.08)' : 'rgba(255,0,60,0.05)',
            fill:             true,
            tension:          0.4,
            pointRadius:      0,
            pointHoverRadius: 4,
            borderWidth:      1.5,
            borderDash:       [4, 3],
            yAxisID:          'y2',
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? 'rgba(8,10,18,0.92)' : 'rgba(255,255,255,0.95)',
            borderColor:     isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderWidth:     1,
            titleColor:      isDark ? '#94A3B8' : '#334155',
            bodyColor:       isDark ? '#F1F5F9' : '#0F172A',
            padding:         10,
          },
        },
        scales: {
          x:  { grid: { color: gridColor, drawBorder: false }, ticks: { color: tickColor, font: { size: 9 }, maxTicksLimit: 6, autoSkip: true }, border: { display: false } },
          y:  { position: 'left',  grid: { color: gridColor, drawBorder: false }, ticks: { color: tickColor, font: { size: 9 }, maxTicksLimit: 4 }, border: { display: false } },
          y2: { position: 'right', grid: { display: false }, ticks: { color: '#FF003C', font: { size: 9 }, maxTicksLimit: 4 }, border: { display: false } },
        },
      },
    });
  }, [fireData, isDark, gridColor, tickColor]);

  useEffect(() => {
    if (window.Chart) { buildChart(); return; }
    const id = setInterval(() => { if (window.Chart) { clearInterval(id); buildChart(); } }, 100);
    return () => clearInterval(id);
  }, [buildChart]);

  useEffect(() => () => { chartRef.current?.destroy(); }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 150 }}>
      <canvas ref={canvasRef} role="img" aria-label="Area chart: average FRP and high-risk fire count over last 24 hours">
        FRP trend over 24 hours.
      </canvas>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StatsPanel({ mobileOpen = false }) {
  const { theme, filteredData, kpis } = useAppContext();
  const { high, mod, low } = kpis;

  const alerts = filteredData
    .filter((d) => d.risk_level === 'High')
    .sort((a, b) => b.frp - a.frp)
    .slice(0, 15);

  return (
    <GlassPanel
      className={`sidebar-panel${mobileOpen ? ' mobile-open' : ''}`}
      style={{ gridColumn: 3, gridRow: '1 / -1', animation: 'fadeInPanel 0.5s ease-out 0.2s both' }}
    >
      <div className="panel-scroll-body" style={{ flex: 1, overflowY: 'auto', padding: 18, scrollbarWidth: 'thin', scrollbarColor: 'rgba(128,128,128,0.15) transparent' }}>

        {/* Bar chart */}
        <SectionHeading>Fires by Risk Level</SectionHeading>
        <ChartLegend items={[
          { color: '#FF003C', label: 'High'     },
          { color: '#FF8A00', label: 'Moderate' },
          { color: '#FFD600', label: 'Low'      },
        ]} />
        <BarChart high={high} mod={mod} low={low} theme={theme} />

        <Divider />

        {/* Line chart */}
        <SectionHeading>FRP Trend — Last 24 h</SectionHeading>
        <ChartLegend items={[
          { color: '#3B82F6', label: 'Avg FRP (MW)'    },
          { color: '#FF003C', label: 'High-Risk Count', dash: true },
        ]} />
        <LineChart fireData={filteredData} theme={theme} />

        <Divider />

        {/* Alerts feed */}
        <SectionHeading>Critical Alerts</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(128,128,128,0.1) transparent' }}>
          {alerts.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              {filteredData.length === 0 ? 'Loading data…' : 'No High-risk points match current filters.'}
            </div>
          ) : (
            alerts.map((d, i) => <AlertItem key={d.id ?? i} point={d} />)
          )}
        </div>
      </div>
    </GlassPanel>
  );
}