'use client';

import { motion } from 'motion/react';
import { HiOutlineBriefcase, HiOutlineUser } from 'react-icons/hi2';
import { card, iconTile } from '@/components/ui/styles';
import { TONES, Chip, itemMotion } from '@/components/organizations/orgUi';

// Card for one assessment / AI interview / live interview config.
// `metrics` is [{ icon, label, title }]; `footer` is an optional node under a divider.
export default function OrgConfigCard({ i, icon: Icon, tone, title, jobTitle, creator, metrics, footer }) {
  return (
    <motion.li {...itemMotion(i)} className={`${card} flex flex-col gap-4 p-5`}>
      <div className="flex items-start gap-3">
        <span className={`${iconTile} h-10 w-10 ${TONES[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 break-words font-semibold">{title}</h3>
            <Chip tone={tone}>Configured</Chip>
          </div>
          {(jobTitle || creator) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {jobTitle && <span className="flex min-w-0 items-center gap-1"><HiOutlineBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{jobTitle}</span></span>}
              {creator && <span className="flex min-w-0 items-center gap-1"><HiOutlineUser className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{creator}</span></span>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
        {metrics.map((m) => (
          <Chip key={m.title} icon={m.icon} title={m.title}>{m.label}</Chip>
        ))}
      </div>
      {footer}
    </motion.li>
  );
}

// Value with unit, or a muted dash when the server left it empty.
export const withUnit = (v, unit) => (v === null || v === undefined || v === '' ? '—' : `${v}${unit}`);
