const integer = new Intl.NumberFormat('pt-BR');
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export const formatNumber = (value: number) => integer.format(value);
export const formatCompact = (value: number) => compact.format(value);

export function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`;
}

/** Variação percentual em relação ao período anterior (null quando não há base de comparação). */
export function trend(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
}

// Os dias dos gráficos são contados no fuso do painel (config/painel.php), não no do navegador
const timeZone = 'America/Sao_Paulo';

export function pointLabel(iso: string, granularity: 'hour' | 'day'): string {
    const date = new Date(iso);
    return granularity === 'hour'
        ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone })
        : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone });
}

export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone });
}
