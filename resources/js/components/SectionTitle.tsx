import Typography, { type TypographyProps } from '@mui/material/Typography';

import { titleFont } from '@/theme';

// Título de seção em caixa alta, alinhado à esquerda, como na referência
export default function SectionTitle({ sx, ...props }: TypographyProps) {
    return (
        <Typography
            variant="h3"
            component="h2"
            sx={[
                { fontFamily: titleFont, fontWeight: 400, fontSize: { xs: 30, md: 40 }, textTransform: 'uppercase', mb: { xs: 4, md: 6 } },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...props}
        />
    );
}
