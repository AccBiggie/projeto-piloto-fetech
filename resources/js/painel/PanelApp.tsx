import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';

import { authApi, panelApi, type Session } from '@/painel/api';
import PanelLayout from '@/painel/components/PanelLayout';
import ClientPage from '@/painel/pages/ClientPage';
import DashboardPage from '@/painel/pages/DashboardPage';
import LoginPage from '@/painel/pages/LoginPage';
import TwoFactorSetupPage from '@/painel/pages/TwoFactorSetupPage';

type State = { status: 'loading' } | { status: 'guest' } | { status: 'ready'; session: Session };

/**
 * Decide a tela pela sessão no servidor: sem login vai para /login; logado sem 2FA confirmado vai para
 * /dois-fatores; com 2FA, o painel. Quem protege os dados é a API (auth + 2FA), não estas rotas.
 */
export default function PanelApp() {
    const [state, setState] = useState<State>({ status: 'loading' });
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const refresh = useCallback(() => {
        panelApi
            .session()
            .then((session) => setState({ status: 'ready', session }))
            // 401 (sem login) ou sessão expirada: volta para o login
            .catch(() => setState({ status: 'guest' }));
    }, []);
    useEffect(refresh, [refresh]);

    const logout = useCallback(async () => {
        await authApi.logout().catch(() => undefined);
        setState({ status: 'guest' });
        navigate('/login', { replace: true });
    }, [navigate]);

    if (state.status === 'loading') {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress aria-label="Carregando" />
            </Box>
        );
    }

    if (state.status === 'guest') {
        return pathname === '/login' ? (
            <LoginPage
                onAuthenticated={() => {
                    navigate('/', { replace: true });
                    refresh();
                }}
            />
        ) : (
            <Navigate to="/login" replace />
        );
    }

    if (!state.session.two_factor_confirmed) {
        return pathname === '/dois-fatores' ? (
            <TwoFactorSetupPage
                onDone={() => {
                    navigate('/', { replace: true });
                    refresh();
                }}
                onLogout={logout}
            />
        ) : (
            <Navigate to="/dois-fatores" replace />
        );
    }

    return (
        <PanelLayout session={state.session} onLogout={logout}>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/clientes/:id" element={<ClientPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </PanelLayout>
    );
}
