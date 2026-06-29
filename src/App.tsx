import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import Compare from '@/pages/Compare';
import Home from '@/pages/Home';
import Methodology from '@/pages/Methodology';
import Auth from '@/pages/Auth';
import Reports from '@/pages/Reports';
import Workspace from '@/pages/Workspace';
import { useAuthStore } from '@/store/useAuthStore';

export default function App() {
  const restore = useAuthStore((state) => state.restore);

  useEffect(() => {
    void restore();
  }, [restore]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
