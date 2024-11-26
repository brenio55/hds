import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
    const [adminUser, setAdminUser] = useState(null);

    const login = (userData) => {
        setAdminUser(userData);
    };

    const logout = () => {
        setAdminUser(null);
    };

    return (
        <AdminContext.Provider value={{ adminUser, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
    }
    return context;
} 