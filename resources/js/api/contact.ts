export type ContactPayload = {
    name: string;
    email: string;
    subject: string;
    message: string;
    website: string;
};

export type ContactResult =
    | { ok: true; message: string }
    | { ok: false; message: string; errors?: Partial<Record<keyof ContactPayload, string[]>> };

export async function sendContact(payload: ContactPayload): Promise<ContactResult> {
    let response: Response;
    try {
        response = await fetch('/api/contato', {
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
