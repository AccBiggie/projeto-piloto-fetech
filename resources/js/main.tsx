import '@fontsource/bungee/400.css';
import '@fontsource/exo/400.css';
import '@fontsource/exo/600.css';
import '@fontsource/exo/700.css';
import '@fontsource/exo/800.css';
import '@fontsource/source-code-pro/400.css';
import '@fontsource/source-code-pro/500.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';
import { theme } from '@/theme';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ErrorBoundary>
        </ThemeProvider>
    </StrictMode>,
);
