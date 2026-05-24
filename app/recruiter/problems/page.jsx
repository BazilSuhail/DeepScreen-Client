'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { AnimatePresence } from 'motion/react';
import {
  HiOutlinePlus,
  HiOutlinePuzzlePiece,
  HiOutlineCodeBracket,
  HiOutlineFaceSmile,
  HiOutlineBolt,
  HiOutlineFire,
} from 'react-icons/hi2';
import PageHeader from '@/components/ui/PageHeader';
import { iconTile } from '@/components/ui/styles';
import ProblemBankSkeleton from '@/components/skeletons/recruiter/ProblemBankSkeleton';
import { EmptyState, ErrorState, StatTile } from '@/components/assessments/ProblemBankStates';
import { btnPrimary } from '@/components/assessments/problemBankStyles';
import ProblemCard from '@/components/assessments/ProblemCard';
import CreateProblemModal from '@/components/assessments/CreateProblemModal';

export default function RecruiterProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const primaryOrgId = organizations[0]?.org_id ?? '';

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        // Problems are listed for the first organization, same as before.
        const orgs = await api.get('/organizations/');
        if (!active) return;
        const list = Array.isArray(orgs) ? orgs : [];
        setOrganizations(list);
        if (list.length > 0) {
          const data = await api.get(`/assessments/problems/?organization_id=${list[0].org_id}`);
          if (!active) return;
          setProblems(Array.isArray(data) ? data : []);
        }
        setError('');
      } catch (err) {
        if (!active) return;
        console.error('Error loading problem bank:', err);
        setError('We could not load the problem bank. Check your connection and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError('');
    setAttempt((n) => n + 1);
  };

  const handleSaved = async () => {
    setIsCreateOpen(false);
    try {
      const data = await api.get(`/assessments/problems/?organization_id=${primaryOrgId}`);
      setProblems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error refreshing problem bank:', err);
      setError('Your problem was saved, but the list could not refresh. Try again.');
    }
  };

  const countOf = (difficulty) => problems.filter((p) => p.difficulty === difficulty).length;

  if (loading) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        <ProblemBankSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <PageHeader
        back={{ href: '/recruiter/assessments', label: 'Assessments' }}
        icon={HiOutlinePuzzlePiece}
        eyebrow="Assessments"
        title="Problem bank"
        description="Reusable coding challenges you can add to any assessment."
        actions={
          <button type="button" onClick={() => setIsCreateOpen(true)} className={btnPrimary}>
            <HiOutlinePlus className="h-5 w-5" aria-hidden="true" />
            Create problem
          </button>
        }
      />

      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={HiOutlineCodeBracket} value={problems.length} label="Total problems" />
          <StatTile icon={HiOutlineFaceSmile} value={countOf('easy')} label="Easy" />
          <StatTile icon={HiOutlineBolt} value={countOf('medium')} label="Medium" />
          <StatTile icon={HiOutlineFire} value={countOf('hard')} label="Hard" />
        </div>
      )}

      {problems.length === 0 ? (
        !error && (
          <EmptyState
            icon={HiOutlineCodeBracket}
            title="No problems yet"
            text="Write a coding challenge once, then reuse it in any assessment."
            action={
              <button type="button" onClick={() => setIsCreateOpen(true)} className={btnPrimary}>
                <HiOutlinePlus className="h-5 w-5" aria-hidden="true" />
                Create problem
              </button>
            }
          />
        )
      ) : (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`${iconTile} h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
              <HiOutlineCodeBracket className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Your problems</h2>
              <p className="text-xs text-muted-foreground">{problems.length} {problems.length === 1 ? 'challenge' : 'challenges'} ready to reuse</p>
            </div>
          </div>
          <ul className="grid gap-3 sm:gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {problems.map((problem, index) => (
              <ProblemCard key={problem.problem_id ?? index} problem={problem} />
            ))}
          </ul>
        </section>
      )}

      <AnimatePresence>
        {isCreateOpen && (
          <CreateProblemModal
            key="create-problem"
            organization={primaryOrgId}
            onClose={() => setIsCreateOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
