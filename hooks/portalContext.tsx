// PortalContext.tsx - Optimized version
import React, { createContext, useState, useContext, ReactNode, useRef, useEffect } from 'react';
import { View } from 'react-native';

type PortalContent = {
    key: string;
    content: ReactNode;
};

type PortalContextType = {
    mount: (key: string, content: ReactNode) => void;
    unmount: (key: string) => void;
};

const PortalContext = createContext<PortalContextType | null>(null);

export const PortalProvider = ({ children }: { children: ReactNode }) => {
    const [portals, setPortals] = useState<PortalContent[]>([]);

    const mount = (key: string, content: ReactNode) => {
        setPortals((prev) => {
            // Check if this key already exists
            const exists = prev.some(item => item.key === key);
            // If it exists, replace it; otherwise add it
            return exists
                ? prev.map(item => item.key === key ? { key, content } : item)
                : [...prev, { key, content }];
        });
    };

    const unmount = (key: string) => {
        setPortals((prev) => prev.filter((item) => item.key !== key));
    };

    return (
        <PortalContext.Provider value={{ mount, unmount }}>
            {children}
            {portals.map(({ key, content }) => (
                <View key={key} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    {content}
                </View>
            ))}
        </PortalContext.Provider>
    );
};

export const usePortal = () => {
    const context = useContext(PortalContext);
    if (!context) {
        throw new Error('usePortal must be used within a PortalProvider');
    }
    return context;
};

// Optimized Portal component using useRef to prevent unnecessary re-renders
export const Portal = ({ name, children }: { name: string; children: ReactNode }) => {
    const { mount, unmount } = usePortal();
    const keyRef = useRef(name);

    // Ensure we update our ref if the name changes
    if (keyRef.current !== name) {
        keyRef.current = name;
    }

    useEffect(() => {
        // Mount the portal content
        mount(keyRef.current, children);
        // Unmount when component unmounts
        return () => unmount(keyRef.current);
    }, [children]);

    return null;
};