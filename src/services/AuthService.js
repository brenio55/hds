class AuthService {
  constructor() {
    this.API_URL = import.meta.env.VITE_API_URL;
  }

    async logout(token) {
        await this.redisService.del(`token:${token}`);
        return true;
    }

    async loginSecullum(username, password) {
      username = import.meta.env.SECULLUM_USERNAME;
      password = import.meta.env.SECULLUM_PASSWORD;

      console.log(username, password);

      try {
        const response = await fetch(`${this.API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Erro ao fazer login');
        }

        return response.json();
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
      }
    }
}

export default new AuthService();
