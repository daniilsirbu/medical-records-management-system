import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DynamicForm } from "./DynamicForm";

interface DynamicFormsListProps {
  patientId: Id<"patients">;
}

export function DynamicFormsList({ patientId }: DynamicFormsListProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editingForm, setEditingForm] = useState<any>(null);
  
  const templates = useQuery(api.formTemplates.list);
  const forms = useQuery(api.dynamicForms.list, { patientId });

  if (selectedTemplate) {
    return (
      <DynamicForm
        template={selectedTemplate}
        patientId={patientId}
        onComplete={() => setSelectedTemplate(null)}
      />
    );
  }

  if (editingForm) {
    return (
      <DynamicForm
        template={editingForm.template}
        patientId={patientId}
        existingForm={editingForm}
        onComplete={() => setEditingForm(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Nouveau formulaire */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Créer un nouveau formulaire</h3>
        
        {!templates ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Chargement des modèles...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded">
            <p className="text-gray-600">Aucun modèle de formulaire disponible</p>
            <p className="text-sm text-gray-500 mt-1">
              Créez d'abord des modèles dans la section "Modèles de formulaires"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template._id}
                onClick={() => setSelectedTemplate(template)}
                className="text-left p-4 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h4 className="font-medium">{template.name}</h4>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {template.sections.length} section{template.sections.length > 1 ? 's' : ''} • {' '}
                  {template.sections.reduce((total, section) => total + section.fields.length, 0)} champ
                  {template.sections.reduce((total, section) => total + section.fields.length, 0) > 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulaires existants */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Formulaires complétés</h3>
        
        {!forms ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Chargement...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded">
            <p className="text-gray-600">Aucun formulaire complété</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <div
                key={form._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded hover:bg-gray-50"
              >
                <div>
                  <h4 className="font-medium">{form.template?.name || "Formulaire"}</h4>
                  <p className="text-sm text-gray-600">
                    Complété le {new Date(form.completedDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingForm(form)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Voir/Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
