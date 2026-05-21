// Base metadata for every recruiter page. The workspace is behind sign-in, so search engines are asked not to index it.
export const metadata = {
  title: {
    default: "Recruiter Dashboard",
    template: "%s · DeepScreen",
  },
  description: "Manage job postings, candidate applications, AI and live interviews, assessments, and analytics on DeepScreen.",
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

export default function RecruiterLayout({ children }) {
  return <>{children}</>;
}
