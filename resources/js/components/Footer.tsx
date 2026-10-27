import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import AnimatedFetechLogo from '@/components/AnimatedFetechLogo';
import FetechLogo from '@/components/FetechLogo';
import { whatsappNumber, whatsappUrl } from '@/components/FloatingActions';
import { navItems } from '@/components/Header';
import { brand } from '@/theme';

// Endereços das redes sociais ainda não definidos (no site antigo também eram "#")
const socials = [
    { label: 'Visite-nos no Youtube!', href: '#', icon: <YouTubeIcon fontSize="small" /> },
    { label: 'Visite-nos no Instagram!', href: '#', icon: <InstagramIcon fontSize="small" /> },
    { label: 'Visite-nos no Facebook!', href: '#', icon: <FacebookIcon fontSize="small" /> },
];

const menu = [...navItems.filter((item) => item.to !== '/'), { label: 'Orçamento', to: '/#contato' }];

// (44) 99883-3731
const whatsappLabel = whatsappNumber.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');

const email = 'fetech.ferreira@gmail.com';
const address = ['Rua Osvaldo Cruz, 317, apto 201', 'Maringá - PR', 'CEP 87020-200'];
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(', '))}`;

const columnTitleSx = { color: '#fff', fontSize: 18, textTransform: 'uppercase', mb: 1.5 } as const;
const linkSx = { color: brand.footerText, lineHeight: '25px', textDecoration: 'none', transition: 'color .3s ease-in', '&:hover': { color: '#fff' } } as const;

export default function Footer() {
    return (
        <Box component="footer">
            <Box sx={{ bgcolor: brand.footer, py: { xs: 6, md: 8.75 } }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                        <Grid size={{ xs: 12, lg: 3 }}>
                            <Box component={RouterLink} to="/" aria-label="Fetech: página inicial" sx={{ color: '#fff', display: 'inline-flex' }}>
                                <FetechLogo sx={{ width: 200, height: 55 }} />
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ mt: 2.5, justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                                {socials.map((social) => (
                                    <Tooltip key={social.label} title={social.label}>
                                        <Box
                                            component="a"
                                            href={social.href}
                                            aria-label={social.label}
                                            sx={{
                                                position: 'relative',
                                                zIndex: 0,
                                                width: 40,
                                                height: 40,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#2e2e2e',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    inset: 0,
                                                    zIndex: -1,
                                                    borderRadius: '50%',
                                                    bgcolor: brand.footerIcon,
                                                    transition: 'transform .3s ease-in',
                                                },
                                                '& svg': { transition: 'transform .3s ease-in, color .3s ease-in' },
                                                '&:hover::before': { transform: 'scale(0)' },
                                                '&:hover svg': { color: '#fff', transform: 'scale(1.7)' },
                                            }}
                                        >
                                            {social.icon}
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 3 }}>
                            <Typography component="h2" sx={columnTitleSx}>
                                Menu
                            </Typography>
                            <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                                {menu.map((item) => (
                                    <li key={item.to}>
                                        <Link component={RouterLink} to={item.to} sx={linkSx}>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 3 }}>
                            <Typography component="h2" sx={columnTitleSx}>
                                Contato
                            </Typography>
                            <Stack component="ul" spacing={0.5} sx={{ m: 0, p: 0, listStyle: 'none', alignItems: { xs: 'center', lg: 'flex-start' } }}>
                                <li>
                                    <Link
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ ...linkSx, display: 'inline-flex', alignItems: 'center', gap: 1 }}
                                    >
                                        <WhatsAppIcon fontSize="small" /> {whatsappLabel}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`mailto:${email}`} sx={{ ...linkSx, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                        <EmailOutlinedIcon fontSize="small" /> {email}
                                    </Link>
                                </li>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, lg: 3 }}>
                            <Typography component="h2" sx={columnTitleSx}>
                                Endereço
                            </Typography>
                            <Link
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ ...linkSx, display: 'inline-flex', alignItems: 'flex-start', gap: 1, textAlign: 'left' }}
                            >
                                <PlaceOutlinedIcon fontSize="small" sx={{ mt: '2px' }} />
                                <span>
                                    {address.map((line) => (
                                        <Box component="span" key={line} sx={{ display: 'block' }}>
                                            {line}
                                        </Box>
                                    ))}
                                </span>
                            </Link>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box data-barra-final sx={{ bgcolor: brand.copyright, py: 1.25 }}>
                <Container maxWidth="lg">
                    <Stack
                        direction={{ xs: 'column', lg: 'row' }}
                        spacing={1}
                        sx={{ alignItems: { xs: 'center', lg: 'flex-end' }, justifyContent: 'space-between' }}
                    >
                        <Typography sx={{ color: brand.footerText, fontSize: 13, textAlign: { xs: 'center', lg: 'left' } }}>
                            © {new Date().getFullYear()} Fetech Hardware & Technology. Todos os direitos reservados.
                        </Typography>
                        <Box
                            component={RouterLink}
                            to="/"
                            aria-label="Fetech: página inicial"
                            sx={{
                                display: 'flex',
                                fill: brand.footerText,
                                // Cor exata da barra: desenha o contorno que separa os bonecos das letras
                                '--fx-fundo': brand.copyright,
                                borderRadius: 0.5,
                                '&:focus-visible': { outline: `2px solid ${brand.footerText}`, outlineOffset: 2 },
                            }}
                        >
                            <AnimatedFetechLogo />
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
