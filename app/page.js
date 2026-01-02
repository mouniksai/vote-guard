'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page on mount
        router.push('/login');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="text-white text-lg">Redirecting to login...</div>
        </div>
    );
}
