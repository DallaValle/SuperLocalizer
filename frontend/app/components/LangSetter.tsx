'use client';

import { useEffect } from 'react';

interface LangSetterProps {
    locale: string;
}

export default function LangSetter({ locale }: LangSetterProps) {
    useEffect(() => {
        // Set the lang attribute on the html element
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    return null;
}