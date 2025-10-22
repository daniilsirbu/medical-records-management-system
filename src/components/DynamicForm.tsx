import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface FormTemplate {
  _id: Id<"formTemplates">;
  name: string;
  description?: string;
  sections: Array<{
    title: string;
    fields: Array<{
      id: string;
      type: "text" | "textarea" | "select" | "radio" | "checkbox" | "date" | "number" | "email" | "phone";
      label: string;
      required?: boolean;
      options?: string[];
      placeholder?: string;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
      };
    }>;
  }>;
}

interface DynamicFormProps {
  template: FormTemplate;
  patientId: Id<"patients">;
  onComplete: () => void;
  existingForm?: any;
}

export function DynamicForm({ template, patientId, onComplete, existingForm }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(
    existingForm?.formData || {}
  );

  const createForm = useMutation(api.dynamicForms.create);
  const updateForm = useMutation(api.dynamicForms.update);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs obligatoires
    const requiredFields = template.sections.flatMap(section => 
      section.fields.filter(field => field.required)
    );

    for (const field of requiredFields) {
      if (!formData[field.id] || (Array.isArray(formData[field.id]) && formData[field.id].length === 0)) {
        alert(`Le champ "${field.label}" est obligatoire`);
        return;
      }
    }

    try {
      if (existingForm) {
        await updateForm({
          formId: existingForm._id,
          formData,
        });
      } else {
        await createForm({
          patientId,
          templateId: template._id,
          formData,
          completedDate: new Date().toISOString().split("T")[0],
        });
      }
      onComplete();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du formulaire");
    }
  };

  const renderField = (field: FormTemplate["sections"][0]["fields"][0]) => {
    const value = formData[field.id] || "";

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
            required={field.required}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
            required={field.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
            required={field.required}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
            required={field.required}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
            required={field.required}
          >
            <option value="">Sélectionnez une option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="mr-2"
                  required={field.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={checkboxValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...checkboxValues, option]
                      : checkboxValues.filter(v => v !== option);
                    handleFieldChange(field.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{template.name}</h1>
        {template.description && (
          <p className="text-gray-600">{template.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {template.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border-t-2 border-gray-300 pt-6">
            <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">
              {section.title}
            </h3>
            
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {existingForm ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
