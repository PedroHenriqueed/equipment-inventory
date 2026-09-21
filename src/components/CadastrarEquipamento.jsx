import { useState } from "react";
import toast from "react-hot-toast";
import EquipmentForm from "../components/EquipmentForm";

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
      setFormKey((k) => k + 1); // remonta o form limpo
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
