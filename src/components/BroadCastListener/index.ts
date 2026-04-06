'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useBroadcastChannel } from '@/hooks/useBroadCastChannel';

export function BroadcastListener() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
     useBroadcastChannel((data) => {
        switch (data?.type) {
            case 'login':
                console.log('login', data);
                router.push('/');
                break;
            case 'logout':
                console.log('logout', data);
                logout()
                router.replace('/login')
                break;

        }
    });



    return null;
}