export type ContactPayload = {
    name: string;
    email: string;
    subject: string;
    message: string;
    website: string;
};

// Resposta dos formulários do site (contato e orçamento): mesma API, mesmos erros
export type FormResult<P> =
    | { ok: true; message: string }
    | { ok: false; message: string; errors?: Partial<Record<keyof P, string[]>> };

export type ContactResult = FormResult<ContactPayload>;

export function sendContact(payload: ContactPayload): Promise<ContactResult> {
    return postForm('/api/contato', payload);
}

export async function postForm<P>(url: string, payload: P): Promise<FormResult<P>> {
    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch {
        return { ok: false, message: 'Não foi possível conectar. Verifique sua internet e tente novamente.' };
    }

    if (response.status === 429) {
        const wait = Number(response.headers.get('Retry-After'));
        const minutes = Number.isFinite(wait) && wait > 0 ? Math.ceil(wait / 60) : 1;
        return {
            ok: false,
            message: `Muitas mensagens enviadas em pouco tempo. Tente novamente em ${minutes} minuto(s).`,
        };
    }

    const body = await response.json().catch(() => ({}));

    if (response.ok) {
        return { ok: true, message: body.message ?? 'Mensagem enviada!' };
    }

    if (response.status === 422) {
        return { ok: false, message: 'Confira os campos destacados.', errors: body.errors };
    }

    return { ok: false, message: 'Erro ao enviar a mensagem. Tente novamente mais tarde.' };
}
