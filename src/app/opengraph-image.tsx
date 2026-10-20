import { ImageResponse } from 'next/og';
import { DataSchema, deriveView } from '@/lib/schema';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site';
import data from '@/lib/data.json';

// Required by `output: 'export'`: rendered once at build time to a static PNG.
export const dynamic = 'force-static';

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Literal values of the `globals.css` tokens: Satori does not read CSS variables.
const BACKGROUND = 'hsl(0 0% 13%)';
const FOREGROUND = 'hsl(0 0% 98%)';
const MUTED = 'hsl(0 0% 70%)';
const PRIMARY = 'hsl(0 90% 66%)';

// The share card for every page. Counts come from the same `deriveView` as the leaderboard, so
// they match the site at the build that produced the card.
export default function OpengraphImage() {
  const views = deriveView(DataSchema.parse(data));
  const stats = [
    { label: 'sospechosos', value: views.length },
    { label: 'condenados', value: views.filter((v) => v.status === 'condenado').length },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: BACKGROUND,
          color: FOREGROUND,
        }}
      >
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: PRIMARY }}>{SITE_NAME}</div>
        <div style={{ display: 'flex', fontSize: 36, color: MUTED, lineHeight: 1.3 }}>{SITE_DESCRIPTION}</div>
        <div style={{ display: 'flex', gap: 80 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 88, fontWeight: 700 }}>{s.value}</div>
              <div style={{ display: 'flex', fontSize: 32, color: MUTED }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
