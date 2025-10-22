import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MedicalAssessmentForm } from "./MedicalAssessmentForm";

export function MedicalFormsList({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [selectedFormType, setSelectedFormType] = useState("medical_assessment");

  const forms = useQuery(api.medicalForms.list, { patientId }) || [];
  const removeForm = useMutation(api.medicalForms.remove);

  const handleEdit = (form: any) => {
    setEditingForm(form);
    setShowNewForm(true);
  };

  const handleComplete = () => {
    setShowNewForm(false);
    setEditingForm(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFormTypeName = (type: string) => {
    switch (type) {
      case "medical_assessment":
        return "Bilan Médical";
      default:
        return type;
    }
  };

  if (showNewForm) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={handleComplete}
            className="text-blue-500 hover:text-blue-600"
          >
            ← Retour à la liste
          </button>
        </div>
        <MedicalAssessmentForm
          patientId={patientId}
          onComplete={handleComplete}
          existingForm={editingForm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Formulaires Médicaux</h3>
        <div className="flex gap-2">
          <select
            value={selectedFormType}
            onChange={(e) => setSelectedFormType(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="medical_assessment">Bilan Médical</option>
          </select>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Nouveau Formulaire
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {forms.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun formulaire médical pour ce patient
          </div>
        ) : (
          forms.map((form) => (
            <div key={form._id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">
                    {getFormTypeName(form.formType)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Complété le: {form.completedDate}
                  </p>
                  <p className="text-sm text-gray-500">
                    Créé le: {formatDate(form._creationTime)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(form)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => removeForm({ formId: form._id })}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Aperçu des informations du formulaire */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Informations personnelles:</h5>
                  <p>
                    <strong>Nom:</strong>{" "}
                    {form.formData.personalInfo.firstName}{" "}
                    {form.formData.personalInfo.lastName}
                  </p>
                  {form.formData.personalInfo.dateOfBirth && (
                    <p>
                      <strong>Date de naissance:</strong>{" "}
                      {form.formData.personalInfo.dateOfBirth}
                    </p>
                  )}
                  {form.formData.personalInfo.city && (
                    <p>
                      <strong>Ville:</strong> {form.formData.personalInfo.city}
                    </p>
                  )}
                </div>
                <div>
                  <h5 className="font-medium mb-2">Informations médicales:</h5>
                  <p>
                    <strong>Sous soins médecin:</strong>{" "}
                    {form.formData.generalInfo.underDoctorCare ? "Oui" : "Non"}
                  </p>
                  {form.formData.generalInfo.doctorCareReason && (
                    <p>
                      <strong>Raison:</strong>{" "}
                      {form.formData.generalInfo.doctorCareReason}
                    </p>
                  )}
                  <p>
                    <strong>Sous soins dermatologue:</strong>{" "}
                    {form.formData.generalInfo.underDermatologistCare ? "Oui" : "Non"}
                  </p>
                </div>
              </div>

              {/* Statut des signatures */}
              <div className="mt-4 pt-4 border-t">
                <h5 className="font-medium mb-2">Signatures:</h5>
                <div className="flex gap-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded ${
                      form.formData.signatures.clientSignature
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Client: {form.formData.signatures.clientSignature ? "✓" : "✗"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      form.formData.signatures.practitionerSignature
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Praticien: {form.formData.signatures.practitionerSignature ? "✓" : "✗"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      form.formData.signatures.medicalDirectorSignature
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Directeur: {form.formData.signatures.medicalDirectorSignature ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
