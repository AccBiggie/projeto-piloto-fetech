import Box from '@mui/material/Box';
import { Route, Routes } from 'react-router';

import CookieConsent from '@/components/CookieConsent';
import FloatingActions from '@/components/FloatingActions';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import BlogPage from '@/pages/BlogPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Box>
            <Footer />
            <FloatingActions />
            <CookieConsent />
        </Box>
    );
}
