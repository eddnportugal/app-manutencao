import { useLayoutPreferences } from "@/hooks/useLayoutPreferences";

interface LayoutPreferencesProviderProps {
  children: React.ReactNode;
}

export function LayoutPreferencesProvider({ children }: LayoutPreferencesProviderProps) {
  // Este hook aplica as preferências de layout ao documento
  useLayoutPreferences();

  return <>{children}</>;
}
