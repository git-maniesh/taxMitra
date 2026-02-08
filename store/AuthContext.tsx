
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AdminRole } from '../types';
import { storageService } from '../services/storageService';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; errorType?: 'NOT_FOUND' | 'INVALID_PWD' }>;
  signup: (email: string, name: string, role: UserRole) => Promise<{ success: boolean; errorType?: 'ALREADY_EXISTS' }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  notifications: Notification[];
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  toggleBookmark: (caId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  verifyEmail: (caId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await storageService.init();
      await refreshUserData();
    };
    initialize();
  }, []);

  const refreshUserData = async () => {
    const savedUserStr = localStorage.getItem('taxmitra_session_user');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        const freshUser = await storageService.findUserById(parsed.id);
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('taxmitra_session_user', JSON.stringify(freshUser));
        }
      } catch (e) {
        localStorage.removeItem('taxmitra_session_user');
      }
    }
  };

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const login = async (email: string, password?: string) => {
    if (email.toLowerCase() === 'adminme@gmail.com') {
      if (password !== 'Manish214') {
        notify('Invalid password for admin access.', 'error');
        return { success: false, errorType: 'INVALID_PWD' as const };
      }
      let admin = await storageService.findUserByEmail(email);
      if (!admin) {
        admin = {
          id: 'admin-001',
          name: 'Super Admin',
          email: 'adminme@gmail.com',
          phone: '0000000000',
          role: UserRole.ADMIN,
          adminRole: AdminRole.SUPER,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminManish',
          isEmailVerified: true
        };
        await storageService.insertOneUser(admin);
      }
      setUser(admin);
      localStorage.setItem('taxmitra_session_user', JSON.stringify(admin));
      notify('Admin access granted.', 'success');
      return { success: true };
    }

    const existingUser = await storageService.findUserByEmail(email);
    if (!existingUser) {
      return { success: false, errorType: 'NOT_FOUND' as const };
    }

    setUser(existingUser);
    localStorage.setItem('taxmitra_session_user', JSON.stringify(existingUser));
    notify(`Welcome back, ${existingUser.name}!`, 'success');
    return { success: true };
  };

  const signup = async (email: string, name: string, role: UserRole) => {
    const existingUser = await storageService.findUserByEmail(email);
    if (existingUser) {
      return { success: false, errorType: 'ALREADY_EXISTS' as const };
    }

    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0].toUpperCase(),
      email: email.toLowerCase(),
      phone: '',
      role: role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      bookmarks: [],
      isEmailVerified: false
    };
    
    await storageService.insertOneUser(newUser);
    setUser(newUser);
    localStorage.setItem('taxmitra_session_user', JSON.stringify(newUser));
    
    if (role === UserRole.CA || role === UserRole.ACCOUNTANT) {
      notify(`Account created! Professional onboarding required.`, 'info');
    } else {
      notify(`Account created successfully! Welcome.`, 'success');
    }
    
    return { success: true };
  };

  const verifyEmail = async (caId: string): Promise<boolean> => {
    if (!user) return false;
    await new Promise(r => setTimeout(r, 1200));

    const updatedUser = await storageService.updateOneUser(user.id, { isEmailVerified: true });
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('taxmitra_session_user', JSON.stringify(updatedUser));
    }

    if (user.role === UserRole.CA || user.role === UserRole.ACCOUNTANT) {
      const profile = await storageService.findProfileById(caId);
      if (profile) {
        await storageService.updateOneProfile(caId, { verificationStatus: 'pending_admin_approval' });
        return true;
      }
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taxmitra_session_user');
    notify('Logged out successfully.');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const updated = await storageService.updateOneUser(user.id, data);
      if (updated) {
        // Synchronize avatar to Professional Profile if applicable
        if (data.avatar && (user.role === UserRole.CA || user.role === UserRole.ACCOUNTANT)) {
          const profile = await storageService.findProfileByUserId(user.id);
          if (profile) {
            await storageService.updateOneProfile(profile.id, { avatar: data.avatar });
          }
        }
        
        setUser(updated);
        localStorage.setItem('taxmitra_session_user', JSON.stringify(updated));
        notify('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Update failed:', err);
      // More descriptive error handling for server limits
      if (err.message?.includes('413')) {
        notify('Network limit exceeded. The compressed image is still too large. Try a different photo.', 'error');
      } else {
        notify('Update failed. Please check your network connection.', 'error');
      }
      throw err; // Propagate to component to stop loading states
    }
  };

  const toggleBookmark = async (caId: string) => {
    if (!user) {
      notify('Please login to bookmark professionals.', 'error');
      return;
    }
    const bookmarks = user.bookmarks || [];
    const index = bookmarks.indexOf(caId);
    if (index > -1) bookmarks.splice(index, 1);
    else bookmarks.push(caId);
    
    const updated = await storageService.updateOneUser(user.id, { bookmarks });
    if (updated) {
      setUser(updated);
      localStorage.setItem('taxmitra_session_user', JSON.stringify(updated));
      notify(bookmarks.includes(caId) ? 'Added to bookmarks' : 'Removed from bookmarks', 'success');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, updateProfile, isAuthenticated: !!user, 
      notifications, notify, toggleBookmark, refreshUserData, verifyEmail 
    }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`pointer-events-auto px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 font-bold text-sm ${
              n.type === 'success' ? 'bg-green-600 border-green-500 text-white' :
              n.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
              'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
