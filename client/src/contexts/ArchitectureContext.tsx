import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ArchitectureData, architectureData as defaultArchitectureData } from '@/data/architecture';
import { storageService } from '@/services/storageService';

interface ArchitectureContextType {
  architecture: ArchitectureData;
  updateArchitecture: (data: ArchitectureData) => void;
  resetArchitecture: () => void;
  isLoading: boolean;
}

const ArchitectureContext = createContext<ArchitectureContextType | undefined>(undefined);

const STORAGE_KEY = 'architecture_config';

export function ArchitectureProvider({ children }: { children: ReactNode }) {
  const [architecture, setArchitecture] = useState<ArchitectureData>(defaultArchitectureData);
  const [isLoading, setIsLoading] = useState(true);

  // Load architecture from storage on mount
  useEffect(() => {
    let isMounted = true;

    async function loadArchitecture() {
      try {
        const stored = await storageService.get<ArchitectureData>(STORAGE_KEY, defaultArchitectureData);
        
        if (!isMounted) return;

        // Ensure services array exists (migration from old format)
        if (!stored.services) {
          stored.services = defaultArchitectureData.services;
        }

        // Validate and merge with defaults to ensure all required fields exist
        const merged: ArchitectureData = {
          services: stored.services || defaultArchitectureData.services,
          vms: stored.vms || defaultArchitectureData.vms,
          proxmoxHost: {
            ...defaultArchitectureData.proxmoxHost,
            ...(stored.proxmoxHost || {}),
          },
        };

        setArchitecture(merged);
      } catch (error) {
        console.error('Failed to load architecture config:', error);
        if (isMounted) {
          setArchitecture(defaultArchitectureData);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArchitecture();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save to storage whenever architecture changes (debounced)
  useEffect(() => {
    if (isLoading) return;

    const timeoutId = setTimeout(async () => {
      try {
        await storageService.set(STORAGE_KEY, architecture);
      } catch (error) {
        console.error('Failed to save architecture config:', error);
      }
    }, 300); // Debounce saves by 300ms

    return () => clearTimeout(timeoutId);
  }, [architecture, isLoading]);

  const updateArchitecture = useCallback((data: ArchitectureData) => {
    setArchitecture(data);
  }, []);

  const resetArchitecture = useCallback(async () => {
    setArchitecture(defaultArchitectureData);
    try {
      await storageService.set(STORAGE_KEY, defaultArchitectureData);
    } catch (error) {
      console.error('Failed to reset architecture config:', error);
    }
  }, []);

  return (
    <ArchitectureContext.Provider value={{ architecture, updateArchitecture, resetArchitecture, isLoading }}>
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

