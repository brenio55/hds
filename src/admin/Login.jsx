import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../commonComponents/Header";
import supabase from "../utils/Supabase";
import { useAdmin } from "../contexts/AdminContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
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

  async function requestLogin(event) {
    event.preventDefault();

    try {
      // Busca o usuário no banco de dados
      const { data, error } = await supabase
        .from("users")
        .select("id, userName, userPassword")
        .eq("userName", user)
        .limit(1);

      if (error) {
        console.error("Erro ao consultar o banco de dados:", error.message);
        setNotification({ message: "Erro ao conectar com o servidor", type: "error" });
        return;
      }

      if (data.length === 0) {
        console.log("Usuário não encontrado!");
        setNotification({ message: "Usuário ou senha inválidos", type: "error" });
        return;
      }

      const userData = data[0];

      // Validação da senha
      if (userData.userPassword === password) {
        console.log("Usuário validado:", userData.userName);
        login(userData); // Salvando os dados do usuário no contexto
        setNotification({ message: `Bem-vindo, ${userData.userName}!`, type: "success" });
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      } else {
        console.log("Senha incorreta.");
        setNotification({ message: "Usuário ou senha inválidos", type: "error" });
      }
    } catch (err) {
      console.error("Erro na validação:", err);
      setNotification({ message: "Erro ao processar a requisição", type: "error" });
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
              <p>Faça Login para acessar esta página</p>
            </div>
            <div className="R">
              {notification.message && (
                <div className={`notification ${notification.type}`}>
                  {notification.message}
                </div>
              )}
              <form onSubmit={requestLogin} method="POST">
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
                <br />
                <button type="submit">Enviar</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
