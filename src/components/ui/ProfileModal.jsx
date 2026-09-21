import { useState, useRef } from "react";
import { X, LogOut, Camera, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfileModal({ usuario, isAdmin, onClose, onLogout }) {
  const [avatarUrl, setAvatarUrl] = useState(
    usuario?.user_metadata?.avatar_url || "",
  );
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState("");
  const fileInputRef = useRef(null);

  const nome =
    usuario?.user_metadata?.full_name ||
    usuario?.email?.split("@")[0] ||
    "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  const acesso = isAdmin ? "Administrador" : "Usuário";
  const loginVia =
    usuario?.app_metadata?.provider === "google" ? "Google" : "E-mail e senha";

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações básicas
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 3MB.");
      return;
    }

    setErro("");
    setUploading(true);

    try {
      const extensao = file.name.split(".").pop();
      const caminho = `${usuario.id}/avatar_${Date.now()}.${extensao}`;

      // 1. Faz upload para o bucket "avatars"
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(caminho, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Obtém a URL pública
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(caminho);

      const novaUrl = publicUrlData.publicUrl;

      // 3. Atualiza o user_metadata do usuário logado
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: novaUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(novaUrl);
    } catch (err) {
      console.error(err);
      setErro("Erro ao enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="profile-modal-header">
          <div className="profile-modal-avatar-wrapper">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={nome}
                className="profile-modal-avatar"
              />
            ) : (
              <div className="profile-modal-avatar-fallback">{inicial}</div>
            )}

            <button
              type="button"
              className="profile-modal-avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Alterar foto"
            >
              {uploading ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {erro && <p className="profile-modal-erro">{erro}</p>}

        <div className="profile-modal-field">
          <span className="profile-modal-label">Nome</span>
          <span className="profile-modal-value">{nome}</span>
        </div>

        <div className="profile-modal-field">
          <span className="profile-modal-label">E-mail</span>
          <span className="profile-modal-value">{usuario?.email}</span>
        </div>

        <div className="profile-modal-field">
          <span className="profile-modal-label">Acesso</span>
          <span className="profile-modal-value">{acesso}</span>
        </div>

        <div className="profile-modal-field">
          <span className="profile-modal-label">Login via</span>
          <span className="profile-modal-value">{loginVia}</span>
        </div>

        <button
          className="profile-modal-logout"
          onClick={onLogout}
          type="button"
        >
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
    </div>
  );
}
