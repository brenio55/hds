import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import Header from "../commonComponents/Header";

const initSession = import.meta.env.VITE_APISRC;
// console.log(initSession)

function Login() {
  const navigate = useNavigate(); // <-- get history from hook
  let Acesso = Int16Array;

  function requestLoginAPI(event) {
    console.log("Login Requisitado");
    event.preventDefault(); // previne o comportamento padrão do Form de encaminhar para outro arquivo reescrevendo a página

    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios
      .post(initSession, { user: user, password: password }) //initSession -> api source //user e password --> banco de dados e UseState
      .then((response) => {
        console.log(response.data);

        if (response.data["acesso"] == "concedido") {
          Acesso = 1;
          console.log("1 > " + event.target[0].value);
          console.log("2 > " + event.target[1].value);

          navigate("/dashboard");
        } else {
          console.log("1 > " + event.target[0].value);
          console.log("2 > " + event.target[1].value);
          Acesso = 0;
        }
      })
      .catch((response) => {
        console.log(response);
      });
  }

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

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
              <form onSubmit={requestLoginAPI} method="POST">
                <label htmlFor="user">Usuário</label>
                <br></br>
                <input
                  type="text"
                  name="user"
                  autoComplete="off"
                  value={user}
                  onChange={(e) => {
                    setUser(e.target.value);
                  }}
                />
                <br></br>
                <label htmlFor="password">Senha</label>
                <br></br>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
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