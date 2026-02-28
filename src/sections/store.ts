import { createContext, useContext, JSX } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { AppState } from "./types";

// Define the shape of our Context value
type SharedStateContextType = [AppState, SetStoreFunction<AppState>];

export const SharedStateContext = createContext<SharedStateContextType>();

export function useSharedState() {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error("useSharedState must be used within a SharedStateProvider");
  }
  return context;
}
