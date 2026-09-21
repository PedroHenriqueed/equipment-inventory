import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Cadastro({ onSucesso, onVoltar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    setCarregando(false);
    if (error) {
      setErro(
        error.message.includes("already registered")
          ? "Este e-mail já está cadastrado."
          : error.message,
      );
      return;
    }
    onSucesso();
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>
        {erro && <div className="login-erro">{erro}</div>}

        <label>Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

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
          minLength={6}
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "Criando conta..." : "Criar conta"}
        </button>
        <button type="button" className="btn-link" onClick={onVoltar}>
          Já tenho conta — Entrar
        </button>
      </form>
    </div>
  );
}
