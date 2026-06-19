import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import HomePage from '@/pages/HomePage';
import DetailPage from '@/pages/DetailPage';
import SignUpPage from '@/pages/SignUpPage';
import ReviewPage from '@/pages/ReviewPage';
import ChecklistPage from '@/pages/ChecklistPage';
import { useGameStore } from '@/store/useGameStore';

export default function App() {
  const initFromMock = useGameStore((s) => s.initFromMock);

  useEffect(() => {
    initFromMock();
  }, [initFromMock]);

  return (
    <BrowserRouter>
      <div className="min-h-screen pt-24 pb-16">
        <Navbar />
        <main className="container max-w-7xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/script/:id" element={<DetailPage />} />
            <Route path="/signup/:id" element={<SignUpPage />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/checklist/:id" element={<ChecklistPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
