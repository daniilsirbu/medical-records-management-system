import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { PatientList } from "./components/PatientList";
import { PatientDetails } from "./components/PatientDetails";
import { PatientImport } from "./components/PatientImport";
import { FormTemplatesList } from "./components/FormTemplatesList";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const user = useQuery(api.auth.loggedInUser);
  const [selectedPatient, setSelectedPatient] = useState<Id<"patients"> | null>(null);
  const [currentView, setCurrentView] = useState<"patients" | "import" | "forms">("patients");

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <SignInForm />
        </div>
      </div>
    );
  }

  // Check if user is authorized
  if (user && !user.isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.536 0L3.278 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès en attente</h2>
            <p className="text-gray-600 mb-6">
              Votre compte a été créé avec succès. Un administrateur doit autoriser votre accès avant que vous puissiez utiliser le système.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Connecté en tant que: <strong>{user.name || user.email}</strong>
            </p>
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                ← Retour à la liste des patients
              </button>
              <SignOutButton />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PatientDetails patientId={selectedPatient} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Système de Gestion Médicale
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => setCurrentView("patients")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === "patients"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Patients
                </button>
                {/* <button
                  onClick={() => setCurrentView("import")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === "import"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Import
                </button>
                <button
                  onClick={() => setCurrentView("forms")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === "forms"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Formulaires
                </button> */}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Connecté en tant que {user.name || user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "patients" && (
          <PatientList onSelectPatient={setSelectedPatient} selectedPatientId={selectedPatient} />
        )}
        {/* {currentView === "import" && <PatientImport />}
        {currentView === "forms" && <FormTemplatesList />} */}
      </div>
    </div>
  );
}
