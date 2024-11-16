import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../commonComponents/Header";
import supabase from "../utils/Supabase";

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

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
        return;
      }

      if (data.length === 0) {
        console.log("Usuário não encontrado!");
        alert("Usuário ou senha inválidos.");
        return;
      }

      const userData = data[0];

      // Validação da senha
      if (userData.userPassword === password) {
        console.log("Usuário validado:", userData.userName);
        alert(`Bem-vindo, ${userData.userName}!`);
        navigate("/dashboard"); // Redireciona para o dashboard
      } else {
        console.log("Senha incorreta.");
        alert("Usuário ou senha inválidos.");
      }
    } catch (err) {
      console.error("Erro na validação:", err);
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
              <form onSubmit={requestLogin} method="POST">
                <label htmlFor="user">Usuário</label>
                <br></br>
                <input
                  type="text"
                  name="user"
                  autoComplete="on"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
                <br></br>
                <label htmlFor="password">Senha</label>
                <br></br>
                <input
                  autoComplete="on"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
