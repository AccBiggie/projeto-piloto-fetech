import '@fontsource/exo/400.css';
import '@fontsource/exo/600.css';
import '@fontsource/exo/700.css';
import '@fontsource/source-code-pro/400.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import ErrorBoundary from '@/components/ErrorBoundary';
import PanelApp from '@/painel/PanelApp';
import { theme } from '@/theme';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
                <BrowserRouter basename="/painel">
                    <PanelApp />
                </BrowserRouter>
            </ErrorBoundary>
        </ThemeProvider>
    </StrictMode>,
);
