import Box from '@mui/material/Box';
import { Route, Routes, useLocation } from 'react-router';

import BackHeader from '@/components/BackHeader';
import CookieConsent from '@/components/CookieConsent';
import FloatingActions from '@/components/FloatingActions';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import BlogPage from '@/pages/BlogPage';
import EmailPage from '@/pages/EmailPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import QuotePage from '@/pages/QuotePage';
import StorePage from '@/pages/StorePage';
import WebsitePage from '@/pages/WebsitePage';

// O orçamento abre sozinho: só o formulário e um cabeçalho para voltar ao site
const formPages = ['/orcamento-site'];

export default function App() {
    const { pathname } = useLocation();
    const formPage = formPages.includes(pathname);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {formPage ? <BackHeader /> : <Header />}
            <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/orcamento-site" element={<QuotePage />} />
                    <Route path="/criacao-de-sites" element={<WebsitePage />} />
                    <Route path="/loja-virtual" element={<StorePage />} />
                    <Route path="/email-profissional" element={<EmailPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Box>
            {!formPage && <Footer />}
            {!formPage && <FloatingActions />}
            <CookieConsent />
        </Box>
    );
}
