/** Route stylisée et petite voiture qui roule au bas du héros. */
export function HeroRoad() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden" aria-hidden>
      <div className="absolute inset-x-0 bottom-6 border-t-[3px] border-dashed border-white/25" />
      <div className="absolute bottom-[26px] left-0 w-full animate-drive">
        <svg width="74" height="30" viewBox="0 0 74 30" className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]">
          <path
            d="M6 20c0-3 1.5-5 4.5-5.6l8-1.6 8.5-6.6C29 5 31 4.4 33.4 4.4h13.8c2.7 0 5 1 6.8 3l5.4 5.8 6.4 1.4c3 .7 5.2 3.3 5.2 6.4v1.7c0 1.4-1.1 2.5-2.5 2.5H8.5C7.1 25.2 6 24.1 6 22.7V20z"
            fill="#fff"
          />
          <path d="M28.5 8.4c.9-.7 2-1.1 3.2-1.1h6.3v6H22.6l5.9-4.9zM41 7.3h6.4c1.6 0 3 .6 4 1.8l3.4 4.2H41v-6z" fill="#cfe9d7" />
          <circle cx="20" cy="24.6" r="5.2" fill="#0e1726" />
          <circle cx="20" cy="24.6" r="2.2" fill="#e6e9f0" />
          <circle cx="56" cy="24.6" r="5.2" fill="#0e1726" />
          <circle cx="56" cy="24.6" r="2.2" fill="#e6e9f0" />
          <rect x="66" y="16" width="5" height="3" rx="1.5" fill="#ffd27a" />
        </svg>
      </div>
    </div>
  );
}
