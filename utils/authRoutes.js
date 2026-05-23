// Send each role directly to its application area after authentication.
export const getPostAuthPath = (data) => {
  switch (data?.user?.role) {
    case "RECRUITER":
      return "/recruiter";
    case "STAFF":
    case "ORGANIZATION":
      return "/organizations";
    case "CANDIDATE":
    default:
      return "/candidate";
  }
};
