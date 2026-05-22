import Link from 'next/link';
import {
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineVideoCamera,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import { listBtnSecondary } from '@/components/interview/InterviewListParts';

export default function JobListCard({ job }) {
  const title = job.job_title || 'Untitled job';
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-colors hover:border-emerald-200 dark:border-white/10 dark:bg-card dark:hover:border-white/20">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400">
          <HiOutlineBuildingOffice2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-emerald-950 dark:text-foreground">{title}</h3>
          <p className="mt-0.5 truncate text-xs text-emerald-800/80 dark:text-muted-foreground">
            {job.organization || 'Organization not set'}
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2 text-xs text-emerald-900 dark:text-muted-foreground">
        <li className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-white/10">
          <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
          {job.default_duration_minutes || 45} min
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-white/10">
          <HiOutlineVideoCamera className="h-3.5 w-3.5" aria-hidden="true" />
          {job.camera_required ? 'Camera on' : 'Camera optional'}
        </li>
      </ul>

      <Link href={`/recruiter/interview/setup/${job.job_id}`} className={`${listBtnSecondary} mt-auto w-full`}>
        <HiOutlineCog6Tooth className="h-4 w-4" aria-hidden="true" />
        Edit configuration
        <span className="sr-only"> for {title}</span>
      </Link>
    </article>
  );
}
