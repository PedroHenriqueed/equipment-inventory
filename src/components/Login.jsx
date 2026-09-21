import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onVoltar, onCriarConta }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { login, loginComGoogle } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await login(email, senha);
      onVoltar();
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleGoogleLogin() {
    setErro("");
    try {
      await loginComGoogle();
      // não precisa chamar onVoltar aqui — o redirect faz isso automaticamente
    } catch {
      setErro("Não foi possível entrar com o Google.");
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        {erro && <div className="login-erro">{erro}</div>}

        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <div className="login-divisor">ou</div>

        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleLogin}
        >
          Entrar com Google
        </button>

        <button type="button" className="btn-link" onClick={onVoltar}>
          Continuar sem login
        </button>
        <button type="button" className="btn-link" onClick={onCriarConta}>
          Não tenho conta — Criar conta
        </button>
      </form>
    </div>
  );
}
