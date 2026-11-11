// Cliente HTTP do painel: mesma origem, cookie de sessão e o token CSRF que o Laravel deixa no cookie XSRF-TOKEN

export class ApiError extends Error {
    constructor(
        public status: number,
        public data: { message?: string; code?: string; errors?: Record<string, string[]> } = {},
    ) {
        super(data.message || `Erro ${status}`);
    }

    /** Primeira mensagem de validação de um campo (ou a mensagem geral). */
    field(name: string): string | undefined {
        return this.data.errors?.[name]?.[0];
    }
}

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export async function request<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    const response = await fetch(path, {
        method: options.method ?? 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
            ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
        const fallback =
            response.status === 429
                ? 'Muitas tentativas. Aguarde um minuto e tente de novo.'
                : response.status === 419
                  ? 'A sessão expirou. Recarregue a página.'
                  : undefined;
        throw new ApiError(response.status, { message: fallback, ...(data ?? {}) });
    }

    return data as T;
}

export type ClientStatus = 'active' | 'suspended';

export type BlockReason = 'manual' | 'nonpayment';

export const blockReasons: Record<BlockReason, string> = {
    manual: 'Bloqueio manual',
    nonpayment: 'Inadimplência',
};

/** Containers do projeto: rodando, parada agendada (stop_at), parando, parados ou religando depois do desbloqueio. */
export interface Containers {
    state: 'running' | 'scheduled' | 'stopping' | 'stopped' | 'starting';
    stop_at: string | null;
}

export interface ClientEvent {
    action: 'blocked' | 'unblocked';
    reason: BlockReason | null;
    note: string | null;
    user: string | null;
    created_at: string | null;
}

export interface Client {
    id: number;
    name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    plan: string | null;
    project: string | null;
    notes: string | null;
    status: ClientStatus;
    suspended_at: string | null;
    block_reason: BlockReason | null;
    block_note: string | null;
    containers: Containers | null;
    domains: string[];
    created_at: string | null;
    events?: ClientEvent[];
}

export interface ClientRow extends Client {
    requests_30d: number;
    spark: number[];
}

export interface Point {
    start: string;
    requests: number;
    status_2xx: number;
    status_3xx: number;
    status_4xx: number;
    status_5xx: number;
    bytes: number;
    duration_ms_total: number;
}

export interface Series {
    period: Period;
    granularity: 'hour' | 'day';
    points: Point[];
    totals: Omit<Point, 'start'> & { avg_ms: number; error_rate: number };
    previous_requests: number;
}

export type Period = '24h' | '7d' | '30d' | '90d';

export interface Session {
    name: string;
    email: string;
    two_factor_confirmed: boolean;
}

export type ClientInput = Pick<Client, 'name' | 'contact_name' | 'email' | 'phone' | 'plan' | 'project' | 'notes' | 'domains'>;

export const panelApi = {
    session: () => request<Session>('/painel/api/sessao'),
    clients: () => request<{ clients: ClientRow[]; summary: { clients: number; active: number; suspended: number }; overview: Series }>('/painel/api/clientes'),
    client: (id: number) => request<Client>(`/painel/api/clientes/${id}`),
    stats: (id: number, period: Period) => request<Series>(`/painel/api/clientes/${id}/estatisticas?period=${period}`),
    create: (input: ClientInput) => request<Client>('/painel/api/clientes', { method: 'POST', body: input }),
    update: (id: number, input: ClientInput) => request<Client>(`/painel/api/clientes/${id}`, { method: 'PUT', body: input }),
    block: (id: number, reason: BlockReason, note: string) => request<Client>(`/painel/api/clientes/${id}/status`, { method: 'PATCH', body: { status: 'suspended', reason, note } }),
    unblock: (id: number, note: string) => request<Client>(`/painel/api/clientes/${id}/status`, { method: 'PATCH', body: { status: 'active', note } }),
    remove: (id: number) => request<void>(`/painel/api/clientes/${id}`, { method: 'DELETE' }),
};

// Rotas do Fortify (prefixo /painel)
export const authApi = {
    login: (email: string, password: string, remember: boolean, captchaToken: string) =>
        request<{ two_factor?: boolean }>('/painel/login', { method: 'POST', body: { email, password, remember, 'g-recaptcha-response': captchaToken } }),
    challenge: (body: { code: string } | { recovery_code: string }) => request('/painel/two-factor-challenge', { method: 'POST', body }),
    logout: () => request('/painel/logout', { method: 'POST' }),
    passwordConfirmed: () => request<{ confirmed: boolean }>('/painel/user/confirmed-password-status'),
    confirmPassword: (password: string) => request('/painel/user/confirm-password', { method: 'POST', body: { password } }),
    enableTwoFactor: () => request('/painel/user/two-factor-authentication', { method: 'POST' }),
    qrCode: () => request<{ svg: string; url: string }>('/painel/user/two-factor-qr-code'),
    secretKey: () => request<{ secretKey: string }>('/painel/user/two-factor-secret-key'),
    confirmTwoFactor: (code: string) => request('/painel/user/confirmed-two-factor-authentication', { method: 'POST', body: { code } }),
    recoveryCodes: () => request<string[]>('/painel/user/two-factor-recovery-codes'),
};
