import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ArchitectureData, architectureData as defaultArchitectureData } from '@/data/architecture';

interface ArchitectureContextType {
  architecture: ArchitectureData;
  updateArchitecture: (data: ArchitectureData) => void;
  resetArchitecture: () => void;
}

const ArchitectureContext = createContext<ArchitectureContextType | undefined>(undefined);

const STORAGE_KEY = 'architecture_config';

export function ArchitectureProvider({ children }: { children: ReactNode }) {
  const [architecture, setArchitecture] = useState<ArchitectureData>(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load architecture config:', error);
    }
    return defaultArchitectureData;
  });

  // Save to localStorage whenever architecture changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(architecture));
    } catch (error) {
      console.error('Failed to save architecture config:', error);
    }
  }, [architecture]);

  const updateArchitecture = (data: ArchitectureData) => {
    setArchitecture(data);
  };

  const resetArchitecture = () => {
    setArchitecture(defaultArchitectureData);
  };

  return (
    <ArchitectureContext.Provider value={{ architecture, updateArchitecture, resetArchitecture }}>
      {children}
    </ArchitectureContext.Provider>
  );
}

export function useArchitecture() {
  const context = useContext(ArchitectureContext);
  if (!context) {
    throw new Error('useArchitecture must be used within ArchitectureProvider');
  }
  return context;
}

