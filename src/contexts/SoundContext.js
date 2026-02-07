import { createContext, useContext } from 'react';

export const SoundContext = createContext({ muted: false });
export function useSoundMuted() { return useContext(SoundContext).muted; }
