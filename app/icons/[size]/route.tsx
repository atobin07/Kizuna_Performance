import { renderAppIcon } from '@/lib/app-icon'

// Stable PNG icon endpoints for the web manifest: /icons/192 and /icons/512.
export function GET(
  _req: Request,
  { params }: { params: { size: string } }
) {
  const size = params.size === '512' ? 512 : 192
  return renderAppIcon(size)
}
