// Base metadata for every candidate page. The dashboard is behind sign-in, so search engines are asked not to index it.
export const metadata = {
  title: {
    default: "Candidate Dashboard",
    template: "%s · DeepScreen",
  },
  description: "Track your job applications, live and AI interviews, assessments, and resumes on DeepScreen.",
  applicationName: "DeepScreen",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export const viewport = {
  themeColor: "#03261d",
};

export default function CandidateLayout({ children }) {
  return <>{children}</>;
}
