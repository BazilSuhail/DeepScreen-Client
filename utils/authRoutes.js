// Where to send a user right after a successful sign-in or sign-up.
// New candidates (and candidates who have not finished setup) go through the setup steps first.
export const getPostAuthPath = (data) => {
  const isCandidate = data?.user?.role === "CANDIDATE";
  const needsSetup = isCandidate && (data?.is_new_user || data?.user?.profile?.setup_completed === false);
  return needsSetup ? "/auth/setup" : "/";
};
