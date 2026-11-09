import Chip from '@mui/material/Chip';

import type { ClientStatus } from '@/painel/api';
import { brand } from '@/theme';

export default function StatusChip({ status }: { status: ClientStatus }) {
    return status === 'active' ? (
        <Chip size="small" label="Ativo" sx={{ bgcolor: 'rgba(130,173,176,.22)', color: '#1f5457', fontWeight: 600 }} />
    ) : (
        <Chip size="small" label="Bloqueado" sx={{ bgcolor: 'rgba(224,20,59,.1)', color: brand.redText, fontWeight: 600 }} />
    );
}
