import { useState, useEffect } from "react";
import {
  SETORES,
  DISPOSITIVOS,
  MODELOS_POR_DISPOSITIVO,
  SISTEMAS_OPERACIONAIS,
  PROCESSADORES,
  MEMORIAS,
  POSSES,
  STATUS,
} from "../constants/options";
import ToogleSwitch from "./ToogleSwitch";
import Dropdown from "./ui/Dropdown";

const EMPTY_FORM = {
  responsavel: "",
  setor: "",
  dispositivo: "",
  modelo: "",
  status: "Em uso",
  sistema_operacional: "",
  processador: "",
  memoria: "",
  numero_serie: "",
  mac: "",
  posse: "",
  patrimonio_dispositivo: "",
  patrimonio_carregador: "",
  monitor: false,
  patrimonio_monitor: "",
  hub_usb: false,
  webcam: false,
  leitor_biometrico: false,
  patrimonio_leitor_biometrico: "",
  fone: false,
};

export default function EquipmentForm({
  initialData,
  onSave,
  onCancel,
  saving,
  externalErrors = {}, // novo
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData ?? EMPTY_FORM);
    setErrors({});
  }, [initialData?.id]);

  // sempre que o backend retornar um erro de duplicidade, mescla com os erros locais
  useEffect(() => {
    if (Object.keys(externalErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...externalErrors }));
    }
  }, [externalErrors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "dispositivo" ? { modelo: "" } : {}),
    }));

    // limpa o erro do campo (local ou vindo do backend) ao digitar
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const modelosDisponiveis = MODELOS_POR_DISPOSITIVO[form.dispositivo] || [];

const validate = () => {
  const errs = {};
  if (!form.responsavel.trim()) errs.responsavel = "Responsável é obrigatório.";
  if (!form.dispositivo.trim()) errs.dispositivo = "Dispositivo é obrigatório.";

  // Verifica duplicidade entre os próprios campos de patrimônio
  const camposPatrimonio = [
    { key: "patrimonio_dispositivo", label: "Dispositivo" },
    { key: "patrimonio_carregador", label: "Carregador" },
    { key: "patrimonio_monitor", label: "Monitor" },
    { key: "patrimonio_leitor_biometrico", label: "Leitor Biométrico" },
  ];

  const valoresPreenchidos = camposPatrimonio.filter(
    (c) => form[c.key] && form[c.key].trim() !== "",
  );

  const contagem = {};
  valoresPreenchidos.forEach((c) => {
    const v = form[c.key].trim();
    contagem[v] = (contagem[v] || []).concat(c.key);
  });

  Object.entries(contagem).forEach(([valor, campos]) => {
    if (campos.length > 1) {
      campos.forEach((campo) => {
        errs[campo] =
          `O patrimônio "${valor}" não pode se repetir entre campos.`;
      });
    }
  });

  setErrors(errs);
  return Object.keys(errs).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
    // não limpa o form aqui automaticamente se houve erro de duplicidade;
    // o próprio componente pai decide (via toast + externalErrors) se o save falhou.
  };

  // limpa o form apenas quando o cadastro realmente foi bem-sucedido
  // (o pai chama onSuccess/reset externo, então deixamos como estava)

  return (
    <form className="equipment-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Field
          label="Responsável *"
          name="responsavel"
          value={form.responsavel}
          onChange={handleChange}
          error={errors.responsavel}
        />

        <Dropdown
          label="Setor"
          name="setor"
          value={form.setor}
          onChange={handleChange}
          options={SETORES}
        />

        <Dropdown
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUS}
        />

        <Dropdown
          label="Dispositivo *"
          name="dispositivo"
          value={form.dispositivo}
          onChange={handleChange}
          options={DISPOSITIVOS}
          error={errors.dispositivo}
        />

        <Dropdown
          label="Modelo"
          name="modelo"
          value={form.modelo}
          onChange={handleChange}
          options={modelosDisponiveis}
          disabled={!form.dispositivo}
          placeholder={
            form.dispositivo ? "Selecione..." : "Escolha o dispositivo primeiro"
          }
        />

        <Dropdown
          label="Sistema Operacional"
          name="sistema_operacional"
          value={form.sistema_operacional}
          onChange={handleChange}
          options={SISTEMAS_OPERACIONAIS}
        />

        <Dropdown
          label="Processador"
          name="processador"
          value={form.processador}
          onChange={handleChange}
          options={PROCESSADORES}
        />

        <Dropdown
          label="Memória"
          name="memoria"
          value={form.memoria}
          onChange={handleChange}
          options={MEMORIAS}
        />

        <Field
          label="Nº de Série"
          name="numero_serie"
          value={form.numero_serie}
          onChange={handleChange}
          error={errors.numero_serie}
        />
        <Field
          label="MAC"
          name="mac"
          value={form.mac}
          onChange={handleChange}
          placeholder="00:1A:2B:3C:4D:5E"
          error={errors.mac}
        />

        <Dropdown
          label="Posse"
          name="posse"
          value={form.posse}
          onChange={handleChange}
          options={POSSES}
        />

        <Field
          label="Patrimônio Dispositivo"
          name="patrimonio_dispositivo"
          value={form.patrimonio_dispositivo}
          onChange={handleChange}
          error={errors.patrimonio_dispositivo}
        />
        <Field
          label="Patrimônio Carregador"
          name="patrimonio_carregador"
          value={form.patrimonio_carregador}
          onChange={handleChange}
          error={errors.patrimonio_carregador}
        />
        <Field
          label="Patrimônio Monitor"
          name="patrimonio_monitor"
          value={form.patrimonio_monitor}
          onChange={handleChange}
          error={errors.patrimonio_monitor}
        />
        <Field
          label="Patrimônio Leitor Biométrico"
          name="patrimonio_leitor_biometrico"
          value={form.patrimonio_leitor_biometrico}
          onChange={handleChange}
          error={errors.patrimonio_leitor_biometrico}
        />
      </div>

      <div className="toogle-group">
        <ToogleSwitch
          label="Monitor"
          checked={form.monitor}
          onChange={(val) => setForm({ ...form, monitor: val })}
        />
        <ToogleSwitch
          label="Hub USB"
          checked={form.hub_usb}
          onChange={(val) => setForm({ ...form, hub_usb: val })}
        />
        <ToogleSwitch
          label="Webcam"
          checked={form.webcam}
          onChange={(val) => setForm({ ...form, webcam: val })}
        />
        <ToogleSwitch
          label="Leitor Biométrico"
          checked={form.leitor_biometrico}
          onChange={(val) => setForm({ ...form, leitor_biometrico: val })}
        />
        <ToogleSwitch
          label="Fone"
          checked={form.fone}
          onChange={(val) => setForm({ ...form, fone: val })}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={saving}>
          {saving
            ? "Salvando..."
            : initialData
              ? "Salvar alterações"
              : "Cadastrar"}
        </button>
        {initialData && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, error, placeholder }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        placeholder={placeholder}
        className={error ? "input-error" : ""}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
