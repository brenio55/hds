import { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

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
                console.log('AdminContext - Token encontrado:', token);
                
                if (!token) {
                    console.log('AdminContext - Nenhum token encontrado, usuário não autenticado');
                    setLoading(false);
                    return;
                }

                console.log('AdminContext - Tentando carregar perfil com token');
                const userData = await ApiService.getProfile();
                console.log('AdminContext - Perfil carregado:', userData);
                setAdminUser(userData);
            } catch (error) {
                console.error('AdminContext - Erro ao carregar perfil:', error);
                // Se houver erro, remove o token inválido
                console.log('AdminContext - Removendo token inválido');
                ApiService.logout();
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const login = async (userData) => {
        console.log('AdminContext - Login com dados:', userData);
        setAdminUser(userData);
        
        try {
            // Após o login, carrega o perfil completo
            console.log('AdminContext - Carregando perfil completo após login');
            const profileData = await ApiService.getProfile();
            console.log('AdminContext - Perfil completo carregado:', profileData);
            setAdminUser(profileData);
        } catch (error) {
            console.error('AdminContext - Erro ao carregar perfil após login:', error);
        }
    };

    const logout = () => {
        ApiService.logout();
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