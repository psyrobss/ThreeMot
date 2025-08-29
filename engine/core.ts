import { createContext } from 'react';
import type { EngineContextType } from './types';

// Create the context with a null default value for runtime checks
export const EngineContext = createContext<EngineContextType | null>(null);