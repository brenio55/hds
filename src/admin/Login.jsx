import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../commonComponents/Header";
import { useAdmin } from "../contexts/AdminContext";
import { userService } from "../services/ApiService";
import "./Login.css";

// Senha de autorização para registro (temporária)
const AUTHORIZATION_CODE = "HDS2024";

function Login() {
  const navigate = useNavigate();
  const { login: setLoggedUser } = useAdmin();
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function handleRegister(event) {
    event.preventDefault();

    if (!user || user.length < 3) {
      setNotification({ message: "O nome de usuário deve ter no mínimo 3 caracteres", type: "error" });
      return;
    }

    if (!password || password.length < 6) {
      setNotification({ message: "A senha deve ter no mínimo 6 caracteres", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setNotification({ message: "As senhas não coincidem", type: "error" });
      return;
    }

    if (authCode !== AUTHORIZATION_CODE) {
      setNotification({ message: "Código de autorização inválido", type: "error" });
      return;
    }

    try {
      const result = await userService.registerUser(
        { userName: user.trim(), password: password.trim() }
      );
      console.log('Resultado do registro:', result);
      setNotification({ message: "Usuário registrado com sucesso!", type: "success" });
      setIsRegistering(false);
    } catch (error) {
      console.error('Erro completo:', error);
      setNotification({ message: error.message || "Erro ao registrar usuário", type: "error" });
    }
  }

  async function requestLogin(event) {
    event.preventDefault();

    if (!user || !password) {
      setNotification({ message: "Usuário e senha são obrigatórios", type: "error" });
      return;
    }

    try {
      console.log('Tentando login com:', { username: user.trim(), password: password.trim() });
      const userData = await userService.login(user.trim(), password.trim());
      console.log('Resultado do login:', userData);
      
      setLoggedUser(userData.user);
      setNotification({ message: `Bem-vindo, ${userData.user.username}!`, type: "success" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error('Erro completo:', error);
      setNotification({ message: error.message || "Usuário ou senha inválidos", type: "error" });
    }
  }

  return (
    <>
      <section className="login">
        <Header></Header>
        <div className="telaCompleta">
          <div className="quadradoLogin">
            <div className="L">
              <img src="/img/LOGO.png" alt="logo" className="logo" />
              <p>{isRegistering ? "Registre-se para criar uma conta" : "Faça Login para acessar esta página"}</p>
            </div>
            <div className="R">
              {notification.message && (
                <div className={`notification ${notification.type}`}>
                  {notification.message}
                </div>
              )}
              <form onSubmit={isRegistering ? handleRegister : requestLogin} method="POST">
                <label htmlFor="user">Usuário</label>
                <input
                  type="text"
                  name="user"
                  autoComplete="on"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
                
                <label htmlFor="password">Senha</label>
                <div className="password-input-container flex">
                  <input
                    autoComplete="on"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar Senha" : "Ver Senha"}
                  </button>
                </div>

                {isRegistering && (
                  <>
                    <label htmlFor="confirmPassword">Confirmar Senha</label>
                    <div className="password-input-container flex">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <label htmlFor="authCode">Código de Autorização</label>
                    <input
                      type="password"
                      name="authCode"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                    />
                  </>
                )}
                
                <br />
                <button type="submit">{isRegistering ? "Registrar" : "Enviar"}</button>
                <button 
                  type="button" 
                  className="toggle-mode"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setNotification({ message: "", type: "" });
                    setUser("");
                    setPassword("");
                    setConfirmPassword("");
                    setAuthCode("");
                  }}
                >
                  {isRegistering ? "Voltar para Login" : "Criar Conta"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
