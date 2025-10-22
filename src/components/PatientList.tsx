import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PatientModal } from "./PatientModal";

export function PatientList({ 
  onSelectPatient,
  selectedPatientId 
}: { 
  onSelectPatient: (id: Id<"patients">) => void;
  selectedPatientId: Id<"patients"> | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const patients = useQuery(api.patients.search, { searchTerm: searchQuery });
  const removePatient = useMutation(api.patients.remove);

  const handleNewPatient = () => {
    setIsModalOpen(true);
  };

  const handlePatientCreated = (id: Id<"patients">) => {
    onSelectPatient(id);
  };

  const handleDeletePatient = async (patientId: Id<"patients">, patientName: string) => {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer le patient "${patientName}" ?\n\n` +
      "Cette action supprimera définitivement :\n" +
      "- Toutes les notes du patient\n" +
      "- Tous les consentements\n" +
      "- Tous les traitements\n" +
      "- Tous les suivis médicaux\n" +
      "- Toutes les photos\n" +
      "- Tous les fichiers associés\n\n" +
      "Cette action est irréversible."
    );
    
    if (confirmed) {
      try {
        console.log("Calling removePatient with:", { patientId: patientId });
        await removePatient({ patientId: patientId });
        // Si le patient supprimé était sélectionné, désélectionner
        if (selectedPatientId === patientId) {
          onSelectPatient(null as any);
        }
        alert("Patient supprimé avec succès.");
      } catch (error) {
        alert("Erreur lors de la suppression du patient: " + error);
      }
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Patients</h2>
          <button
            onClick={handleNewPatient}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Nouveau Patient
          </button>
        </div>
      <input
        type="search"
        placeholder="Rechercher un patient..."
        className="w-full p-2 border rounded mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ul className="space-y-2">
        {patients?.map((patient) => (
          <li
            key={patient._id}
            className={`p-2 hover:bg-gray-100 cursor-pointer rounded border ${
              selectedPatientId === patient._id ? "bg-blue-100 border-blue-300" : ""
            }`}
          >
            <div 
              onClick={() => onSelectPatient(patient._id)}
              className="flex-1"
            >
              <div className="font-medium">{patient.name}</div>
              <div className="text-sm text-gray-500">
                Né(e) le: {patient.dateOfBirth}
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePatient(patient._id, patient.name);
                }}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                title="Supprimer le patient"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
      </div>
      
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePatientCreated}
      />
    </>
  );
}
