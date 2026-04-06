'use client';

import { useCallback, useEffect, useRef } from 'react';

export type AppMessage = {
    type: 'login' | 'logout' | 'lang-updated';
    payload?: unknown;
};

const APP_CHANNEL_NAME = 'demo-broadcast';



export type BroadcastMessage =
    | { type: 'logout' }
    | { type: 'login' }

export const useBroadcastChannel = (
    onMessage?: (message: BroadcastMessage) => void
) => {
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('BroadcastChannel' in window)) return;


        if (channelRef.current) return
        const channel = new BroadcastChannel(APP_CHANNEL_NAME);
        channelRef.current = channel;

        channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
            onMessage?.(event.data);
        };

        return () => {
            channel.close();
            channelRef.current = null;
        };
    }, [onMessage]);

    const postMessage = useCallback((message: BroadcastMessage) => {
        channelRef.current?.postMessage(message);
    }, []);

    return { postMessage };
};
