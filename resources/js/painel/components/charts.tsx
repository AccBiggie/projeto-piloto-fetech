import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { useId } from 'react';

import type { Point, Series } from '@/painel/api';
import { formatCompact, formatNumber, pointLabel } from '@/painel/format';
import { brand } from '@/theme';

// Gradiente padrão da FETECH: o vermelho da marca descendo para o vinho (redDark), como o brilho do topo da home
export const fetechGradient = { from: brand.red, to: brand.redDark };

// Cores por classe de status: sucesso em teal, redirecionamento em névoa, erros do visitante em grafite e do servidor em vermelho
export const statusColors = { status_2xx: brand.teal, status_3xx: brand.mist, status_4xx: brand.ink, status_5xx: brand.red } as const;

function Gradients({ id }: { id: string }) {
    return (
        <defs>
            <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={fetechGradient.to} />
                <stop offset="100%" stopColor={fetechGradient.from} />
            </linearGradient>
            <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fetechGradient.from} stopOpacity={0.45} />
                <stop offset="100%" stopColor={fetechGradient.to} stopOpacity={0.02} />
            </linearGradient>
        </defs>
    );
}

/** Requisições ao longo do período: linha e área com o gradiente da marca. */
export function RequestsChart({ series, height = 300, dark = false }: { series: Series; height?: number; dark?: boolean }) {
    const id = useId().replace(/:/g, '');
    const labels = series.points.map((point) => pointLabel(point.start, series.granularity));
    const axisColor = dark ? 'rgba(255,255,255,.6)' : brand.ink;

    return (
        <LineChart
            height={height}
            margin={{ left: 0, right: 24, top: 12, bottom: 0 }}
            xAxis={[{ scaleType: 'point', data: labels, tickLabelStyle: { fill: axisColor, fontSize: 11 } }]}
            yAxis={[{ valueFormatter: (value: number) => formatCompact(value), tickLabelStyle: { fill: axisColor, fontSize: 11 }, width: 44 }]}
            series={[
                {
                    id: 'requests',
                    data: series.points.map((point) => point.requests),
                    label: 'Requisições',
                    area: true,
                    showMark: false,
                    curve: 'monotoneX',
                    color: fetechGradient.from,
                    valueFormatter: (value) => formatNumber(value ?? 0),
                },
            ]}
            grid={{ horizontal: true }}
            hideLegend
            sx={{
                [`& .${lineClasses.area}`]: { fill: `url(#${id}-area)` },
                [`& .${lineClasses.line}`]: { stroke: `url(#${id}-line)`, strokeWidth: 2.5 },
                '& .MuiChartsGrid-line': { stroke: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)' },
                '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)' },
            }}
        >
            <Gradients id={id} />
        </LineChart>
    );
}

const statusSeries: { key: keyof typeof statusColors; label: string }[] = [
    { key: 'status_2xx', label: '2xx sucesso' },
    { key: 'status_3xx', label: '3xx redirecionamento' },
    { key: 'status_4xx', label: '4xx erro do visitante' },
    { key: 'status_5xx', label: '5xx erro do servidor' },
];

/** Respostas por classe de status, empilhadas por hora ou dia. */
export function StatusChart({ series, height = 260 }: { series: Series; height?: number }) {
    return (
        <BarChart
            height={height}
            margin={{ left: 0, right: 24, top: 12, bottom: 0 }}
            xAxis={[{ scaleType: 'band', data: series.points.map((point) => pointLabel(point.start, series.granularity)), tickLabelStyle: { fontSize: 11 } }]}
            yAxis={[{ valueFormatter: (value: number) => formatCompact(value), tickLabelStyle: { fontSize: 11 }, width: 44 }]}
            series={statusSeries.map(({ key, label }) => ({
                id: key,
                label,
                stack: 'status',
                color: statusColors[key],
                data: series.points.map((point: Point) => point[key]),
                valueFormatter: (value: number | null) => formatNumber(value ?? 0),
            }))}
            grid={{ horizontal: true }}
            slotProps={{ legend: { position: { vertical: 'bottom', horizontal: 'center' } } }}
            sx={{ '& .MuiChartsGrid-line': { stroke: 'rgba(0,0,0,.06)' } }}
        />
    );
}

/** Minissérie de 30 dias da lista de clientes, com a área no gradiente da marca. */
export function Sparkline({ data, label }: { data: number[]; label: string }) {
    const id = useId().replace(/:/g, '');

    return (
        <Box role="img" aria-label={label} sx={{ width: 120, height: 36 }}>
            <SparkLineChart
                data={data}
                height={36}
                area
                curve="monotoneX"
                color={fetechGradient.from}
                sx={{
                    [`& .${lineClasses.area}`]: { fill: `url(#${id}-area)` },
                    [`& .${lineClasses.line}`]: { stroke: `url(#${id}-line)`, strokeWidth: 1.5 },
                }}
            >
                <Gradients id={id} />
            </SparkLineChart>
        </Box>
    );
}
