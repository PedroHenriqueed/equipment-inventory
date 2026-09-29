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

const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

const EMPTY_FORM = {
  responsavel: "",
  setor: "",
  dispositivo: "",
  modelo: "",
  hostname: "",
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
  externalErrors = {},
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [statusTocado, setStatusTocado] = useState(!!initialData);

  useEffect(() => {
    setForm(initialData ?? EMPTY_FORM);
    setErrors({});
    setStatusTocado(!!initialData);
  }, [initialData?.id]);

  useEffect(() => {
    if (Object.keys(externalErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...externalErrors }));
    }
  }, [externalErrors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "status") setStatusTocado(true);

    const finalValue = name === "mac" ? value.toUpperCase() : value;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : finalValue,
      ...(name === "dispositivo" ? { modelo: "" } : {}),
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleToggleAcessorio = (campoToggle, campoPatrimonio) => (val) => {
    setForm((prev) => ({
      ...prev,
      [campoToggle]: val,
      ...(campoPatrimonio && !val ? { [campoPatrimonio]: "" } : {}),
    }));

    if (campoPatrimonio && errors[campoPatrimonio]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[campoPatrimonio];
        return next;
      });
    }
  };

  const modelosDisponiveis = MODELOS_POR_DISPOSITIVO[form.dispositivo] || [];

  const validate = () => {
    const errs = {};
    if (!form.responsavel.trim())
      errs.responsavel = "Responsável é obrigatório.";
    if (!form.dispositivo.trim())
      errs.dispositivo = "Dispositivo é obrigatório.";

    if (form.mac.trim() && !MAC_REGEX.test(form.mac.trim())) {
      errs.mac = "MAC inválido. Use o formato AA:BB:CC:DD:EE:FF.";
    }

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
  };

  return (
    <form className="equipment-form" onSubmit={handleSubmit}>
      {/* ===== Seção: Identificação ===== */}
      <div className="form-section">
        <h3 className="form-section-title">Identificação</h3>
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

          <div className="field">
            <Dropdown
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={STATUS}
            />
          </div>

          <Dropdown
            label="Posse"
            name="posse"
            value={form.posse}
            onChange={handleChange}
            options={POSSES}
          />
        </div>
      </div>

      {/* ===== Seção: Equipamento ===== */}
      <div className="form-section">
        <h3 className="form-section-title">Equipamento</h3>
        <div className="form-grid form-grid--limited">
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
              form.dispositivo
                ? "Selecione..."
                : "Escolha o dispositivo primeiro"
            }
          />

          <Field
            label="Hostname"
            name="hostname"
            value={form.hostname}
            onChange={handleChange}
            placeholder="Ex: NB-INFRA-01"
            error={errors.hostname}
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
        </div>
      </div>

      {/* ===== Seção: Acessórios e Patrimônio ===== */}
      <div className="form-section">
        <h3 className="form-section-title">Acessórios e Patrimônio</h3>

        <div className="form-grid">
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
            disabled={!form.monitor}
            placeholder={form.monitor ? "" : "--"}
          />
          <Field
            label="Patrimônio Leitor Biométrico"
            name="patrimonio_leitor_biometrico"
            value={form.patrimonio_leitor_biometrico}
            onChange={handleChange}
            error={errors.patrimonio_leitor_biometrico}
            disabled={!form.leitor_biometrico}
            placeholder={
              form.leitor_biometrico
                ? ""
                : "--"
            }
          />
        </div>

        <div className="toogle-group">
          <ToogleSwitch
            label="Monitor"
            checked={form.monitor}
            onChange={handleToggleAcessorio("monitor", "patrimonio_monitor")}
          />
          <ToogleSwitch
            label="Hub USB"
            checked={form.hub_usb}
            onChange={handleToggleAcessorio("hub_usb", null)}
          />
          <ToogleSwitch
            label="Webcam"
            checked={form.webcam}
            onChange={handleToggleAcessorio("webcam", null)}
          />
          <ToogleSwitch
            label="Leitor Biométrico"
            checked={form.leitor_biometrico}
            onChange={handleToggleAcessorio(
              "leitor_biometrico",
              "patrimonio_leitor_biometrico",
            )}
          />
          <ToogleSwitch
            label="Fone"
            checked={form.fone}
            onChange={handleToggleAcessorio("fone", null)}
          />
        </div>
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

function Field({ label, name, value, onChange, error, placeholder, disabled }) {
  const inputId = `field-${name}`;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        placeholder={placeholder}
        disabled={disabled}
        className={error ? "input-error" : ""}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <span id={`${inputId}-error`} className="error">
          {error}
        </span>
      )}
    </div>
  );
}
