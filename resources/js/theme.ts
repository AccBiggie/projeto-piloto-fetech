import { createTheme } from '@mui/material/styles';

import { revealCss } from '@/reveal/revealObserver';

// Layout inspirado em tytotech.com.br, com a paleta da Fetech.
// Para trocar a identidade visual, basta mudar os tokens abaixo.
export const brand = {
    red: '#e0143b',
    redDark: '#8c0a24',
    redHover: '#ff0000',
    teal: '#82adb0',
    mist: '#c7d0cc',
    ink: '#53534a',
    dark: '#212529',
    whatsapp: '#25d366',
    // Fundos das seções (cinza claro, rodapé e barra de copyright)
    section: '#ebebeb',
    sectionAlt: '#f8f8f8',
    footer: '#2d2d2d',
    footerText: '#8f8f8f',
    footerIcon: '#4e4949',
    copyright: '#191919',
};

// Degradê vertical do topo e das figuras geométricas
export const brandGradient = `linear-gradient(180deg, ${brand.redDark} 0%, ${brand.red} 100%)`;

export const titleFont = '"Bungee", "Exo", sans-serif';

export const theme = createTheme({
    palette: {
        primary: { main: brand.red, dark: '#b10f2f', contrastText: '#fff' },
        secondary: { main: brand.teal, contrastText: '#fff' },
        background: { default: brand.section, paper: '#fff' },
        text: { primary: brand.dark, secondary: brand.ink },
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily: '"Exo", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: revealCss,
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { borderRadius: 4, paddingInline: 22 } },
        },
    },
});
