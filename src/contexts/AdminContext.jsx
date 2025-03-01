import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/ApiService';

const AdminContext = createContext();

export function AdminProvider({ children }) {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Carrega o perfil do usuário ao iniciar
    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Verifica se existe um token
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const userData = await userService.getProfile();
                setAdminUser(userData);
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                // Se houver erro, remove o token inválido
                userService.logout();
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const login = async (userData) => {
        setAdminUser(userData);
        try {
            // Após o login, carrega o perfil completo
            const profileData = await userService.getProfile();
            setAdminUser(profileData);
        } catch (error) {
            console.error('Erro ao carregar perfil após login:', error);
        }
    };

    const logout = () => {
        userService.logout();
        setAdminUser(null);
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <AdminContext.Provider value={{ adminUser, login, logout, loading }}>
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