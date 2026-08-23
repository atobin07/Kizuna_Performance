import { ImageResponse } from 'next/og'

/**
 * Renders the Kizuna hanko-seal app icon at a given size as a PNG.
 * Pure geometry (concentric gold rings on sumi) — no font dependency, so it
 * rasterizes identically everywhere and is safe in the build.
 */
export function renderAppIcon(size: number) {
  const outer = Math.round(size * 0.66)
  const inner = Math.round(size * 0.5)
  const ring = Math.max(2, Math.round(size * 0.045))
  const hairline = Math.max(1, Math.round(size * 0.012))
  const dot = Math.max(4, Math.round(size * 0.08))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0B0C',
        }}
      >
        <div
          style={{
            width: outer,
            height: outer,
            borderRadius: 9999,
            border: `${ring}px solid #E7B24C`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: inner,
              height: inner,
              borderRadius: 9999,
              border: `${hairline}px solid rgba(231,178,76,0.55)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: dot,
                height: dot,
                borderRadius: 9999,
                background: '#E7B24C',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
