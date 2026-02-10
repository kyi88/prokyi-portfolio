import { createContext, useContext } from 'react';

// デフォルトで効果音ON
export const SoundContext = createContext({ muted: false });
export function useSoundMuted() { return useContext(SoundContext).muted; }
