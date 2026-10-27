import { type FormResult, postForm } from '@/api/contact';

export type QuotePayload = {
    name: string;
    email: string;
    phone: string;
    services: string[];
    needs: string[];
    references: string;
    details: string;
    website: string;
};

export type QuoteResult = FormResult<QuotePayload>;

export function sendQuote(payload: QuotePayload): Promise<QuoteResult> {
    return postForm('/api/orcamento-site', payload);
}
