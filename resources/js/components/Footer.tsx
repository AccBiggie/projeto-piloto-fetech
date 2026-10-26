import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import FetechLogo from '@/components/FetechLogo';
import { brand } from '@/theme';

// Endereços das redes sociais ainda não definidos (no site antigo também eram "#")
const socials = [
    { label: 'Visite-nos no Youtube!', href: '#', icon: <YouTubeIcon /> },
    { label: 'Visite-nos no Instagram!', href: '#', icon: <InstagramIcon /> },
    { label: 'Visite-nos no Facebook!', href: '#', icon: <FacebookIcon /> },
];

export default function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: brand.dark, color: '#fff', py: { xs: 5, md: 8 } }}>
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
                        <Box component={RouterLink} to="/" aria-label="Fetech: página inicial" sx={{ color: '#fff', display: 'flex' }}>
                            <FetechLogo sx={{ width: 200, height: 55 }} />
                        </Box>
                        <Typography variant="body2">
                            © {new Date().getFullYear()} Fetech Hardware & Technology, Inc
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        {socials.map((social) => (
                            <Tooltip key={social.label} title={social.label}>
                                <IconButton
                                    href={social.href}
                                    aria-label={social.label}
                                    sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,.15)' } }}
                                >
                                    {social.icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
