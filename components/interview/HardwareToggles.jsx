import { HiOutlineCamera, HiOutlineMicrophone, HiOutlineComputerDesktop } from 'react-icons/hi2';
import { focusRing } from '@/components/ui/styles';

const ITEMS = [
  { name: 'camera_required', label: 'Camera', icon: HiOutlineCamera },
  { name: 'mic_required', label: 'Microphone', icon: HiOutlineMicrophone },
  { name: 'screen_share_enabled', label: 'Screen share', icon: HiOutlineComputerDesktop },
];

// Camera / mic / screen-share switches shared by the setup and schedule forms.
export default function HardwareToggles({ values, onToggle, disabled = false }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ITEMS.map(({ name, label, icon: Icon }) => {
        const on = !!values[name];
        return (
          <button
            key={name}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => onToggle(name)}
            className={`flex min-h-14 items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-[color,background-color,border-color,translate,scale] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none ${focusRing} ${
              on
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                : 'border-emerald-100 bg-card hover:border-emerald-200 dark:border-white/10 dark:hover:border-white/20'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold">
              <Icon className={`h-5 w-5 shrink-0 ${on ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} aria-hidden="true" />
              <span className={on ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
            </span>
            <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} aria-hidden="true">
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[translate] ${on ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
