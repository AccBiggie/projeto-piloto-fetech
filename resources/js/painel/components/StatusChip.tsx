import Chip from '@mui/material/Chip';

import { type ClientStatus, clientStatuses } from '@/painel/api';
import { brand } from '@/theme';

const colors: Record<ClientStatus, { bgcolor: string; color: string }> = {
    active: { bgcolor: 'rgba(130,173,176,.22)', color: '#1f5457' },
    suspended: { bgcolor: 'rgba(224,20,59,.1)', color: brand.redText },
    cancelled: { bgcolor: 'rgba(83,83,74,.12)', color: brand.ink },
};

export default function StatusChip({ status }: { status: ClientStatus }) {
    return <Chip size="small" label={clientStatuses[status]} sx={{ ...colors[status], fontWeight: 600 }} />;
}
