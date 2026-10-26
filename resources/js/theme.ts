import { createTheme } from '@mui/material/styles';

const headingFont = '"Source Code Pro", monospace';

// Paleta herdada do site anterior (public/css/config.css)
export const brand = {
    red: '#e0143b',
    redHover: '#ff0000',
    teal: '#82adb0',
    mist: '#c7d0cc',
    ink: '#53534a',
    dark: '#212529',
    whatsapp: '#25d366',
};

export const theme = createTheme({
    palette: {
        primary: { main: brand.red, dark: '#b10f2f', contrastText: '#fff' },
        secondary: { main: brand.teal, contrastText: '#fff' },
        background: { default: '#f4f6f5', paper: '#fff' },
        text: { primary: brand.dark, secondary: brand.ink },
    },
    shape: { borderRadius: 8 },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: headingFont, fontWeight: 700 },
        h2: { fontFamily: headingFont, fontWeight: 700 },
        h3: { fontFamily: headingFont, fontWeight: 700 },
        h4: { fontFamily: headingFont, fontWeight: 700 },
        h5: { fontFamily: headingFont, fontWeight: 700 },
        h6: { fontFamily: headingFont, fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { borderRadius: 20, paddingInline: 22 } },
        },
    },
});
