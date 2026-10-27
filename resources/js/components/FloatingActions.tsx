import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Zoom from '@mui/material/Zoom';
import useScrollTrigger from '@mui/material/useScrollTrigger';

import { scrollToSection } from '@/navigation';
import { brand } from '@/theme';

export const whatsappNumber = '5544998833731';
export const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export default function FloatingActions() {
    const showTop = useScrollTrigger({ disableHysteresis: true, threshold: 300 });

    return (
        <Stack spacing={1.5} sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 'speedDial', alignItems: 'center' }}>
            <Zoom in={showTop}>
                <Fab
                    size="small"
                    color="secondary"
                    aria-label="Voltar ao topo"
                    onClick={() => scrollToSection('inicio')}
                >
                    <KeyboardArrowUpIcon />
                </Fab>
            </Zoom>
            <Fab
                component="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fale conosco pelo WhatsApp"
                sx={{ bgcolor: brand.whatsapp, color: '#fff', '&:hover': { bgcolor: '#1ebe57' } }}
            >
                <WhatsAppIcon />
            </Fab>
        </Stack>
    );
}
