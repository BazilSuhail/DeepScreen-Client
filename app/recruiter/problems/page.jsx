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
import DashboardBanner, { BannerBlock } from '@/components/dashboard/DashboardBanner';
import PageSkeleton from '@/components/dashboard/PageSkeleton';
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

  return (
    <div className="mx-auto w-full min-w-0 space-y-8 px-4 pb-16 md:px-8">
      {/* Banner first, in loading and loaded states. The primary action sits in aside. */}
      <DashboardBanner
        loading={loading}
        icon={HiOutlinePuzzlePiece}
        title="Problem bank"
        subtitle="Reusable coding challenges you can add to any assessment."
        aside={
          loading ? (
            <div className="flex flex-wrap gap-2">
              <BannerBlock className="h-11 w-40 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button type="button" onClick={() => setIsCreateOpen(true)} className={btnPrimary}>
                <HiOutlinePlus className="h-5 w-5" aria-hidden="true" />
                Create problem
              </button>
            </div>
          )
        }
      />

      {error && <ErrorState message={error} onRetry={retry} />}

      {loading && <PageSkeleton stats={4} cards={3} banner={false} />}

      {!loading && (
        <>
          {!error && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
            <ul className="space-y-3 sm:space-y-4">
              {problems.map((problem, index) => (
                <ProblemCard key={problem.problem_id ?? index} problem={problem} />
              ))}
            </ul>
          )}
        </>
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
