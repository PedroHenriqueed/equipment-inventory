import { useState } from "react";
import toast from "react-hot-toast";
import EquipmentForm from "../components/EquipmentForm";
import PageHeader from "./ui/PageHeader";

export default function CadastrarEquipamento({ onSave, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formKey, setFormKey] = useState(0);

  const handleSave = async (formData) => {
    setSaving(true);
    setFieldErrors({});
    try {
      await onSave(formData);
      toast.success("Equipamento cadastrado com sucesso!");
      setFormKey((k) => k + 1);
      onSuccess();
    } catch (err) {
      if (err?.type === "duplicate" && err.field?.field) {
        toast.error(`${err.field.label} já cadastrado em outro equipamento.`);
        setFieldErrors({
          [err.field.field]: `${err.field.label} já está em uso.`,
        });
      } else {
        toast.error("Erro ao cadastrar equipamento.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <PageHeader title="Cadastrar Equipamento" />
      </div>

      <EquipmentForm
        key={formKey}
        initialData={null}
        onSave={handleSave}
        onCancel={null}
        saving={saving}
        externalErrors={fieldErrors}
      />
    </div>
  );
}
