/**
 * theme.js
 * Single source of truth for all design tokens per theme.
 * These values are injected as CSS custom properties on <html>
 * so every component can use var(--token) without prop drilling.
 */

export const THEMES = {
  dark: {
    // Surfaces
    '--bg-page':           '#020408',
    '--panel-bg':          'rgba(8, 10, 18, 0.72)',
    '--panel-bg-light':    'rgba(14, 18, 32, 0.55)',
    '--surface':           'rgba(255, 255, 255, 0.03)',
    '--surface-hover':     'rgba(255, 255, 255, 0.06)',

    // Borders
    '--border':            'rgba(255, 255, 255, 0.07)',
    '--border-hover':      'rgba(255, 255, 255, 0.14)',

    // Text
    '--text-primary':      '#F1F5F9',
    '--text-secondary':    '#94A3B8',
    '--text-muted':        '#475569',

    // Shadows & blur
    '--panel-shadow':      '0 8px 48px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05) inset',
    '--blur':              'blur(20px) saturate(140%)',

    // Status bar
    '--statusbar-bg':      'rgba(4, 6, 12, 0.85)',

    // Accents (same in both themes)
    '--high':              '#FF003C',
    '--high-glow':         'rgba(255, 0, 60, 0.35)',
    '--mod':               '#FF8A00',
    '--mod-glow':          'rgba(255, 138, 0, 0.3)',
    '--low':               '#FFD600',
    '--low-glow':          'rgba(255, 214, 0, 0.25)',
    '--accent-blue':       '#3B82F6',
    '--accent-cyan':       '#06B6D4',

    // Chart colors (hardcoded for Chart.js which can't read CSS vars)
    '--chart-grid':        'rgba(255,255,255,0.04)',
    '--chart-tick':        '#64748B',
  },

  satellite: {
    // Surfaces — clean frosted glass readable over green/blue satellite imagery
    '--bg-page':           'transparent',
    '--panel-bg':          'rgba(255, 255, 255, 0.82)',
    '--panel-bg-light':    'rgba(245, 248, 255, 0.75)',
    '--surface':           'rgba(0, 0, 0, 0.04)',
    '--surface-hover':     'rgba(0, 0, 0, 0.08)',

    // Borders
    '--border':            'rgba(0, 0, 0, 0.10)',
    '--border-hover':      'rgba(0, 0, 0, 0.20)',

    // Text
    '--text-primary':      '#0F172A',
    '--text-secondary':    '#334155',
    '--text-muted':        '#94A3B8',

    // Shadows & blur
    '--panel-shadow':      '0 8px 48px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.8) inset',
    '--blur':              'blur(24px) saturate(160%)',

    // Status bar
    '--statusbar-bg':      'rgba(255, 255, 255, 0.88)',

    // Accents — same semantic colors, slightly deeper for light bg legibility
    '--high':              '#D90030',
    '--high-glow':         'rgba(217, 0, 48, 0.25)',
    '--mod':               '#D97706',
    '--mod-glow':          'rgba(217, 119, 6, 0.22)',
    '--low':               '#B45309',
    '--low-glow':          'rgba(180, 83, 9, 0.18)',
    '--accent-blue':       '#2563EB',
    '--accent-cyan':       '#0891B2',

    '--chart-grid':        'rgba(0,0,0,0.06)',
    '--chart-tick':        '#94A3B8',
  },
};

/**
 * Injects theme tokens as CSS custom properties on <html>.
 * Call this whenever the theme changes.
 */
export function applyTheme(themeName) {
  const tokens = THEMES[themeName] ?? THEMES.dark;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  root.setAttribute('data-theme', themeName);
}