import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FormBuilder } from "./FormBuilder";

export function FormTemplatesList() {
  const [showBuilder, setShowBuilder] = useState(false);
  const templates = useQuery(api.formTemplates.list);
  const removeTemplate = useMutation(api.formTemplates.remove);

  const handleDelete = async (templateId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce modèle de formulaire ?")) {
      await removeTemplate({ templateId: templateId as any });
    }
  };

  if (showBuilder) {
    return <FormBuilder onComplete={() => setShowBuilder(false)} />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Modèles de formulaires</h2>
        <button
          onClick={() => setShowBuilder(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Nouveau formulaire
        </button>
      </div>

      {!templates ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Aucun modèle de formulaire créé</p>
          <button
            onClick={() => setShowBuilder(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Créer votre premier formulaire
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template._id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Supprimer
                </button>
              </div>
              
              {template.description && (
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              )}
              
              <div className="text-sm text-gray-500">
                <p>{template.sections.length} section{template.sections.length > 1 ? 's' : ''}</p>
                <p>
                  {template.sections.reduce((total, section) => total + section.fields.length, 0)} champ
                  {template.sections.reduce((total, section) => total + section.fields.length, 0) > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-400">
                  Créé le {new Date(template._creationTime).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
