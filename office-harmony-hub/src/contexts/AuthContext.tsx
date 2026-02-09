// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { User, UserRole } from '@/types';

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string, role: UserRole) => void;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const mockUsers: Record<UserRole, User> = {
//   super_admin: {
//     id: '1',
//     name: 'John Super Admin',
//     email: 'superadmin@office.com',
//     phone: '+1 234 567 890',
//     department: 'Management',
//     role: 'super_admin',
//     joiningDate: '2020-01-15',
//   },
//   admin: {
//     id: '2',
//     name: 'Sarah Admin',
//     email: 'admin@office.com',
//     phone: '+1 234 567 891',
//     department: 'HR',
//     role: 'admin',
//     joiningDate: '2021-03-20',
//     companyId: '1',
//   },
//   employee: {
//     id: '3',
//     name: 'Mike Employee',
//     email: 'employee@office.com',
//     phone: '+1 234 567 892',
//     department: 'Engineering',
//     role: 'employee',
//     joiningDate: '2022-06-10',
//     companyId: '1',
//   },
// };

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);

//   const login = (email: string, password: string, role: UserRole) => {
//     // Mock login - in real app, this would be an API call
//     setUser(mockUsers[role]);
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };














import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>; // role optional
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);


  const login = async (email: string, password: string, role?: UserRole) => {
    // role parameter ko ignore karenge lekin signature match ho jaaye
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      if (res.status === 200) {
        toast({
          title: "Login Successfully.",
          description: `${data?.message}`,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.message || String(error) || "Something went wrong",
        variant: "destructive",
      });
    }
    finally {
    setLoading(false); // stop loading
  }
  };

  const logout = () => {
    toast({
      title: "Logout Successfully.",
      description: `Logout Successfully.`,
    });
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
