import { createContext, useContext } from "react";

// The raw context – no UI, no hooks
//  Snack context — any page can call showSnack without prop-drilling 
export const SnackContext = createContext(null);

// Custom hook that consumes the context
export function useSnack() {
  const ctx = useContext(SnackContext);
  if (!ctx) {
    throw new Error("useSnack must be used inside a <SnackProvider>");
  }
  return ctx;
};
