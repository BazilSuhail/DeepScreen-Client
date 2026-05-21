// Decorative SVG shapes for profile banners. Sits behind the content in a `relative overflow-hidden` parent.
// The colour comes from the `className` text colour, e.g. "text-emerald-400/20".
export default function BannerShapes({ className = "" }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Dot grid, top left */}
      <svg className="absolute -left-4 -top-4 h-36 w-36" viewBox="0 0 144 144">
        <defs>
          <pattern id="banner-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="144" height="144" fill="url(#banner-dots)" />
      </svg>

      {/* Ring pair, top right */}
      <svg className="absolute -right-14 -top-16 h-64 w-64" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" strokeLinecap="round" />
      </svg>

      {/* Angular shards, bottom right */}
      <svg className="absolute -bottom-2 right-0 h-36 w-72" viewBox="0 0 280 150" preserveAspectRatio="none">
        <path d="M0 150 L140 150 L280 30 L280 150 Z" fill="currentColor" />
        <path d="M70 150 L190 62 L220 150 Z" fill="currentColor" opacity="0.5" />
      </svg>

      {/* Plus mark, bottom left */}
      <svg className="absolute bottom-6 left-1/3 h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 4 V20 M4 12 H20" />
      </svg>
    </div>
  );
}
