import { useEffect } from 'react';
import { useLocation } from 'react-router';

import About from '@/components/About';
import ContactForm from '@/components/ContactForm';
import Hero from '@/components/Hero';
import Services from '@/components/Services';

export default function HomePage() {
    const { hash } = useLocation();

    // Links do menu como "/#servicos" vindos de outra página
    useEffect(() => {
        if (hash) {
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [hash]);

    return (
        <>
            <Hero />
            <About />
            <Services />
            <ContactForm />
        </>
    );
}
