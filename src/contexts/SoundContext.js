import { createContext, useContext } from 'react';

// デフォルトでミュート
export const SoundContext = createContext({ muted: true });
export function useSoundMuted() { return useContext(SoundContext).muted; }
