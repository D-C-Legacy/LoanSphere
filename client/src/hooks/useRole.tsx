import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RoleContextType {
  selectedRole: string | null;
  setSelectedRole: (role: string) => void;
  clearSelectedRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const [selectedRole, setSelectedRoleState] = useState<string | null>(null);

  // Load role from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole');
    if (storedRole) {
      setSelectedRoleState(storedRole);
    }
  }, []);

  const setSelectedRole = (role: string) => {
    setSelectedRoleState(role);
    localStorage.setItem('selectedRole', role);
  };

  const clearSelectedRole = () => {
    setSelectedRoleState(null);
    localStorage.removeItem('selectedRole');
  };

  return (
    <RoleContext.Provider value={{ selectedRole, setSelectedRole, clearSelectedRole }}>
      {children}
    </RoleContext.Provider>
  );
};