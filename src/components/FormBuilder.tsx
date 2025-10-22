import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface FormField {
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
}

interface FormSection {
  title: string;
  fields: FormField[];
}

export function FormBuilder({ onComplete }: { onComplete: () => void }) {
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [sections, setSections] = useState<FormSection[]>([
    {
      title: "Section 1",
      fields: [],
    },
  ]);

  const createTemplate = useMutation(api.formTemplates.create);

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}`,
        fields: [],
      },
    ]);
  };

  const updateSection = (index: number, title: string) => {
    const newSections = [...sections];
    newSections[index].title = title;
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const addField = (sectionIndex: number) => {
    const newSections = [...sections];
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "text",
      label: "Nouveau champ",
      required: false,
    };
    newSections[sectionIndex].fields.push(newField);
    setSections(newSections);
  };

  const updateField = (sectionIndex: number, fieldIndex: number, field: Partial<FormField>) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields[fieldIndex] = {
      ...newSections[sectionIndex].fields[fieldIndex],
      ...field,
    };
    setSections(newSections);
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields.splice(fieldIndex, 1);
    setSections(newSections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName.trim()) {
      alert("Veuillez entrer un nom pour le formulaire");
      return;
    }

    if (sections.some(section => section.fields.length === 0)) {
      alert("Chaque section doit contenir au moins un champ");
      return;
    }

    try {
      await createTemplate({
        name: formName,
        description: formDescription || undefined,
        sections,
      });
      onComplete();
    } catch (error) {
      console.error("Erreur lors de la création du formulaire:", error);
      alert("Erreur lors de la création du formulaire");
    }
  };

  const fieldTypes = [
    { value: "text", label: "Texte" },
    { value: "textarea", label: "Zone de texte" },
    { value: "select", label: "Liste déroulante" },
    { value: "radio", label: "Boutons radio" },
    { value: "checkbox", label: "Cases à cocher" },
    { value: "date", label: "Date" },
    { value: "number", label: "Nombre" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Téléphone" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Créateur de formulaire</h2>
        
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du formulaire *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
              placeholder="Ex: Formulaire de consultation initiale"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
              rows={3}
              placeholder="Description optionnelle du formulaire"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, e.target.value)}
                  className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addField(sectionIndex)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    + Champ
                  </button>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Supprimer section
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Libellé</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, { label: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, { 
                            type: e.target.value as FormField["type"],
                            options: ["select", "radio", "checkbox"].includes(e.target.value) ? ["Option 1"] : undefined
                          })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(sectionIndex, fieldIndex, { required: e.target.checked })}
                            className="mr-1"
                          />
                          Obligatoire
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(sectionIndex, fieldIndex)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {field.placeholder !== undefined && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Texte d'aide</label>
                        <input
                          type="text"
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, { placeholder: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Texte d'aide pour l'utilisateur"
                        />
                      </div>
                    )}

                    {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Options</label>
                        <div className="space-y-2">
                          {(field.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(field.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateField(sectionIndex, fieldIndex, { options: newOptions });
                                }}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
                                  updateField(sectionIndex, fieldIndex, { options: newOptions });
                                }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                              updateField(sectionIndex, fieldIndex, { options: newOptions });
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            + Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {section.fields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun champ dans cette section</p>
                    <button
                      type="button"
                      onClick={() => addField(sectionIndex)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Ajouter le premier champ
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={addSection}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Ajouter une section
          </button>

          <div className="flex gap-4">
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
              Créer le formulaire
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
