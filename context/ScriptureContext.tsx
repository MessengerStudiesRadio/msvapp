import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface ScripturePopoverState {
    reference: string | null;
    targetRect: DOMRect | null;
}

interface ScriptureContextType {
    showScripture: (reference: string, target: HTMLElement) => void;
    hideScripture: () => void;
    hideScriptureImmediately: () => void;
    keepScriptureVisible: () => void;
    popoverState: ScripturePopoverState;
}

const ScriptureContext = createContext<ScriptureContextType | undefined>(undefined);

export const ScriptureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [popoverState, setPopoverState] = useState<ScripturePopoverState>({ reference: null, targetRect: null });
    const hideTimeout = useRef<number | null>(null);

    const showScripture = useCallback((reference: string, target: HTMLElement) => {
        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
            hideTimeout.current = null;
        }
        setPopoverState({ reference, targetRect: target.getBoundingClientRect() });
    }, []);
    
    const keepScriptureVisible = useCallback(() => {
        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
            hideTimeout.current = null;
        }
    }, []);

    const hideScripture = useCallback(() => {
        hideTimeout.current = window.setTimeout(() => {
            setPopoverState({ reference: null, targetRect: null });
        }, 200); // Delay to allow moving mouse into popover
    }, []);

    const hideScriptureImmediately = useCallback(() => {
        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
            hideTimeout.current = null;
        }
        setPopoverState({ reference: null, targetRect: null });
    }, []);

    const value = { showScripture, hideScripture, hideScriptureImmediately, keepScriptureVisible, popoverState };

    return (
        <ScriptureContext.Provider value={value}>
            {children}
        </ScriptureContext.Provider>
    );
};

export const useScripture = (): ScriptureContextType => {
    const context = useContext(ScriptureContext);
    if (!context) {
        throw new Error('useScripture must be used within a ScriptureProvider');
    }
    return context;
};