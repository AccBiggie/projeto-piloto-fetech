import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function BlogPage() {
    return (
        <Container maxWidth="md" sx={{ py: 10 }}>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <ArticleOutlinedIcon color="primary" sx={{ fontSize: 64 }} />
                <Typography variant="h4" component="h1">
                    Blog
                </Typography>
                <Typography color="text.secondary">Em breve, novidades e dicas de tecnologia da Fetech.</Typography>
            </Stack>
        </Container>
    );
}
