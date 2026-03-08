import { createContext, useContext, useState, ReactNode } from 'react';

interface GuestModeContextType {
  guestMode: boolean;
  toggleGuestMode: () => void;
}

const GuestModeContext = createContext<GuestModeContextType>({ guestMode: false, toggleGuestMode: () => {} });

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [guestMode, setGuestMode] = useState(false);
  return (
    <GuestModeContext.Provider value={{ guestMode, toggleGuestMode: () => setGuestMode(p => !p) }}>
      {children}
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  return useContext(GuestModeContext);
}
