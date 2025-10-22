import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PatientNotes } from "./PatientNotes";
import { ConsentList } from "./ConsentList";
import { ConsentForm } from "./ConsentForm";
import { BeforeAfterPhotos } from "./BeforeAfterPhotos";
import { MiscellaneousFiles } from "./MiscellaneousFiles";
import { FollowUpList } from "./FollowUpList";
import { MedicalFollowUp } from "./MedicalFollowUp";
import { MedicalFormsList } from "./MedicalFormsList";
import { MedicalAssessmentForm } from "./MedicalAssessmentForm";
import { DynamicFormsList } from "./DynamicFormsList";
import { PostTreatmentInstructions } from "./PostTreatmentInstructions";
import { PatientEditForm } from "./PatientEditForm";

interface PatientDetailsProps {
  patientId: Id<"patients">;
}

export function PatientDetails({ patientId }: PatientDetailsProps) {
  const patient = useQuery(api.patients.get, { id: patientId });
  const [activeTab, setActiveTab] = useState("info");
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Informations" },
    { id: "notes", label: "Notes" },
    { id: "consents", label: "Consentements" },
    { id: "photos", label: "Photos" },
    { id: "files", label: "Fichiers" },
    { id: "followups", label: "Suivis" },
    { id: "medical-forms", label: "Formulaires médicaux" },
    { id: "dynamic-forms", label: "Nouveaux formulaires" },
    { id: "instructions", label: "Instructions" },
  ];

  if (showEditForm) {
    return (
      <PatientEditForm
        patient={patient}
        onComplete={() => setShowEditForm(false)}
      />
    );
  }

  if (showConsentForm) {
    return (
      <ConsentForm
        patientId={patientId}
        onComplete={() => setShowConsentForm(false)}
      />
    );
  }

  if (showMedicalForm) {
    return (
      <MedicalAssessmentForm
        patientId={patientId}
        onComplete={() => setShowMedicalForm(false)}
      />
    );
  }

  if (showFollowUpForm) {
    return (
      <MedicalFollowUp
        patientId={patientId}
        onComplete={() => setShowFollowUpForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du patient */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>Date de naissance: {patient.dateOfBirth}</p>
              {patient.email && <p>Email: {patient.email}</p>}
              {patient.phone && <p>Téléphone: {patient.phone}</p>}
              {patient.address && (
                <p>
                  Adresse: {patient.address}
                  {patient.city && `, ${patient.city}`}
                  {patient.state && `, ${patient.state}`}
                  {patient.postal && ` ${patient.postal}`}
                </p>
              )}
            </div>
          </div>
          <div className="text-right space-y-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              ✏️ Modifier les informations
            </button>
            {patient.balance !== undefined && (
              <div className="text-lg font-semibold">
                Solde: {patient.balance.toFixed(2)} $
              </div>
            )}
            {patient.cid && (
              <div className="text-sm text-gray-600">CID: {patient.cid}</div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Informations du patient</h3>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Modifier
                </button>
              </div>
              
              {/* Informations de base */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-3">Informations de base</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <p className="mt-1 text-sm text-gray-900">{patient.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                    <p className="mt-1 text-sm text-gray-900">{patient.dateOfBirth}</p>
                  </div>
                  {patient.firstName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prénom</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.firstName}</p>
                    </div>
                  )}
                  {patient.lastName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de famille</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.lastName}</p>
                    </div>
                  )}
                  {patient.gender && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Genre</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.gender}</p>
                    </div>
                  )}
                  {patient.age && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Âge</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.age}</p>
                    </div>
                  )}
                  {patient.pronoun && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pronom</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.pronoun}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordonnées */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-3">Coordonnées</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.email}</p>
                    </div>
                  )}
                  {patient.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone principal</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
                    </div>
                  )}
                  {patient.homePhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone domicile</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.homePhone}</p>
                    </div>
                  )}
                  {patient.workPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone travail</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.workPhone}</p>
                    </div>
                  )}
                  {patient.cellPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone cellulaire</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.cellPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Adresse */}
              {(patient.address || patient.city || patient.state || patient.postal) && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-purple-600 mb-3">Adresse</h4>
                  <div className="space-y-2">
                    {patient.address && (
                      <p className="text-sm text-gray-900">{patient.address}</p>
                    )}
                    {patient.address2 && (
                      <p className="text-sm text-gray-900">{patient.address2}</p>
                    )}
                    <p className="text-sm text-gray-900">
                      {[patient.city, patient.state, patient.postal].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Informations financières */}
              {(patient.cid || patient.balance !== undefined || patient.amount !== undefined || patient.paid !== undefined) && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-orange-600 mb-3">Informations financières</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.cid && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CID</label>
                        <p className="mt-1 text-sm text-gray-900">{patient.cid}</p>
                      </div>
                    )}
                    {patient.balance !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Solde</label>
                        <p className="mt-1 text-sm text-gray-900">${patient.balance.toFixed(2)}</p>
                      </div>
                    )}
                    {patient.amount !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Montant</label>
                        <p className="mt-1 text-sm text-gray-900">${patient.amount.toFixed(2)}</p>
                      </div>
                    )}
                    {patient.paid !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Statut de paiement</label>
                        <p className="mt-1 text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded text-xs ${patient.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {patient.paid ? 'Payé' : 'Non payé'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Préférences de communication */}
              {(patient.dnd !== undefined || patient.smsReminder !== undefined || patient.emailConf !== undefined) && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-600 mb-3">Préférences de communication</h4>
                  <div className="space-y-2">
                    {patient.dnd !== undefined && (
                      <p className="text-sm">
                        <span className="font-medium">Ne pas déranger:</span>{" "}
                        <span className={`px-2 py-1 rounded text-xs ${patient.dnd ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {patient.dnd ? 'Oui' : 'Non'}
                        </span>
                      </p>
                    )}
                    {patient.smsReminder !== undefined && (
                      <p className="text-sm">
                        <span className="font-medium">Rappels SMS:</span>{" "}
                        <span className={`px-2 py-1 rounded text-xs ${patient.smsReminder ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {patient.smsReminder ? 'Activés' : 'Désactivés'}
                        </span>
                      </p>
                    )}
                    {patient.emailConf !== undefined && (
                      <p className="text-sm">
                        <span className="font-medium">Confirmation par email:</span>{" "}
                        <span className={`px-2 py-1 rounded text-xs ${patient.emailConf ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {patient.emailConf ? 'Activée' : 'Désactivée'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Informations marketing */}
              {(patient.campaign || patient.promo || patient.pPurchaseDate || patient.apptDate || patient.apptServiceName) && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-red-600 mb-3">Marketing et rendez-vous</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.campaign && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Campagne</label>
                        <p className="mt-1 text-sm text-gray-900">{patient.campaign}</p>
                      </div>
                    )}
                    {patient.promo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Promotion</label>
                        <p className="mt-1 text-sm text-gray-900">{patient.promo}</p>
                      </div>
                    )}
                    {patient.pPurchaseDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date d'achat</label>
                        <p className="mt-1 text-sm text-gray-900">{patient.pPurchaseDate}</p>
                      </div>
                    )}
                    {patient.apptDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date de rendez-vous</label>
                        <p className="mt-1 text-sm text-gray-900">{patient.apptDate}</p>
                      </div>
                    )}
                    {patient.apptServiceName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Service de rendez-vous</label>
                        <p className="mt-1 text-sm text-gray-900">{patient.apptServiceName}</p>
                      </div>
                    )}
                    {patient.dateCreated && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date de création</label>
                        <p className="mt-1 text-sm text-gray-900">{patient.dateCreated}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && <PatientNotes patientId={patientId} />}

          {activeTab === "consents" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Consentements</h3>
                <button
                  onClick={() => setShowConsentForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Nouveau consentement
                </button>
              </div>
              <ConsentList patientId={patientId} />
            </div>
          )}

          {activeTab === "photos" && <BeforeAfterPhotos patientId={patientId} />}

          {activeTab === "files" && <MiscellaneousFiles patientId={patientId} />}

          {activeTab === "followups" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Suivis médicaux</h3>
                <button
                  onClick={() => setShowFollowUpForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Nouveau suivi
                </button>
              </div>
              <FollowUpList patientId={patientId} />
            </div>
          )}

          {activeTab === "medical-forms" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Formulaires médicaux</h3>
                <button
                  onClick={() => setShowMedicalForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Nouveau bilan médical
                </button>
              </div>
              <MedicalFormsList patientId={patientId} />
            </div>
          )}

          {activeTab === "dynamic-forms" && (
            <div>
              <h3 className="text-lg font-medium mb-4">Nouveaux formulaires</h3>
              <DynamicFormsList patientId={patientId} />
            </div>
          )}

          {activeTab === "instructions" && (
            <PostTreatmentInstructions patientId={patientId} />
          )}
        </div>
      </div>
    </div>
  );
}
