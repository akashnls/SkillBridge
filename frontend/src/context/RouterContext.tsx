import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  pathname: string;
  params: Record<string, string>;
  queryParams: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === path) return;
    window.history.pushState(null, '', to);
    setPath(to.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to extract simple params
  const pathname = path.split('?')[0];
  const params: Record<string, string> = {};
  if (pathname.startsWith('/verify/')) {
    params.badgeCode = pathname.replace('/verify/', '');
  } else if (pathname.startsWith('/recruiter/candidates/')) {
    params.candidateId = pathname.replace('/recruiter/candidates/', '');
    params.id = params.candidateId;
  } else if (pathname.startsWith('/recruiter/jobs/edit/')) {
    params.id = pathname.replace('/recruiter/jobs/edit/', '');
    params.jobId = params.id;
  } else if (pathname.startsWith('/jobs/')) {
    params.jobId = pathname.replace('/jobs/', '');
    params.id = params.jobId;
  } else if (pathname.startsWith('/candidate/jobs/')) {
    params.jobId = pathname.replace('/candidate/jobs/', '');
    params.id = params.jobId;
  } else if (pathname.startsWith('/candidate/mock-interview/review/')) {
    params.sessionId = pathname.replace('/candidate/mock-interview/review/', '');
    params.id = params.sessionId;
  } else if (pathname.startsWith('/candidate/assessments/')) {
    params.assessmentId = pathname.replace('/candidate/assessments/', '');
    params.id = params.assessmentId;
  }

  // Parse query parameters
  const queryParams: Record<string, string> = {};
  const searchStr = window.location.search;
  if (searchStr) {
    const searchParams = new URLSearchParams(searchStr);
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
  }

  return (
    <RouterContext.Provider value={{ path: pathname, navigate, pathname, params, queryParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};


