// Shared class strings. Import these instead of redefining focusRing/primaryButton/card per file.
// Radius scale (round only where it helps): rounded-full avatars/dots/toggles · rounded-lg (8px) cards, panels, modals ·
// rounded-md (6px) buttons, inputs · rounded-sm (4px) chips, badges, icon tiles · square for rows/cells inside a card.

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Tactile press: every button dips slightly while held. Disabled under reduced motion.
const press = "transition-[color,background-color,border-color,box-shadow,transform,translate,scale,rotate] duration-150 active:scale-[0.97] motion-reduce:transform-none";

const buttonBase = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold ${press} disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${focusRing}`;

export const primaryButton = `${buttonBase} bg-primary text-primary-foreground shadow-sm hover:bg-emerald-500`;
export const secondaryButton = `${buttonBase} border border-emerald-200 bg-card text-emerald-800 hover:bg-emerald-50 dark:border-white/10 dark:text-foreground dark:hover:bg-white/5`;
export const ghostButton = `${buttonBase} text-muted-foreground hover:bg-muted hover:text-foreground`;
export const dangerButton = `${buttonBase} bg-red-600 text-white hover:bg-red-500`;
// Square icon-only button; 44px tap target.
export const iconButton = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground ${press} hover:bg-muted hover:text-foreground ${focusRing}`;

export const card = "rounded-lg border border-emerald-100 bg-card text-card-foreground dark:border-white/10";
export const cardPadded = `${card} p-5 lg:p-6`;
// For cards that are links/buttons: lift on hover, settle on press.
export const cardInteractive = `${card} cursor-pointer transition-[border-color,box-shadow,transform,translate,scale,rotate] duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none dark:hover:border-emerald-500/40 ${focusRing}`;
export const iconTile = "flex shrink-0 items-center justify-center rounded-sm";

export const labelClass = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";
export const inputClass = `min-h-11 w-full rounded-md border border-emerald-200 bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-emerald-500 dark:border-white/10 dark:bg-background ${focusRing}`;
export const hintClass = "text-xs leading-relaxed text-muted-foreground";
export const errorClass = "text-xs font-medium text-red-600 dark:text-red-400";

export const badge = "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium";

// Type scale. One h1 style for every app page; marketing/auth heroes may go one step larger.
export const pageTitle = "text-2xl font-semibold tracking-tight lg:text-3xl";
export const sectionTitle = "text-lg font-semibold";
