import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const POST_TREATMENT_INSTRUCTIONS = {
  "Expérience thermale": "- Boire beaucoup d'eau dans les 24h suivant le soin\n- Éviter les expositions au soleil pendant 24h\n- Se reposer pendant 2-3h après le soin\n- Éviter l'alcool le jour du soin",
  "Bilan Santé": "- Conserver les résultats d'analyses\n- Suivre les recommandations personnalisées\n- Programmer les examens complémentaires si nécessaire",
  "Médico-Esthéthique": "- Éviter le maquillage pendant 24h\n- Appliquer la crème prescrite 2x/jour\n- Éviter l'exposition solaire pendant 7 jours\n- Utiliser un écran solaire SPF50",
  "Poly": "- Suivre le protocole de soins personnalisé\n- Respecter les intervalles entre les séances\n- Noter tout effet secondaire inhabituel",
  "Infusion": "- Éviter les efforts physiques pendant 24h\n- Maintenir une bonne hydratation\n- Suivre le régime alimentaire recommandé\n- Signaler tout effet indésirable",
  "Peeling chimique": "- Ne pas toucher ou gratter la peau\n- Éviter l'eau chaude pendant 48h\n- Appliquer la crème cicatrisante prescrite\n- Protection solaire stricte pendant 2 semaines",
  "Vasculyse 2GRF": "- Éviter les bains chauds pendant 48h\n- Ne pas exposer la zone au soleil pendant 7 jours\n- Appliquer la crème prescrite selon le protocole\n- Éviter les activités physiques intenses pendant 24h",
  "Fractionnement/Raffermissement": "- Appliquer des compresses froides si nécessaire\n- Éviter le sauna/hammam pendant 7 jours\n- Hydrater la peau selon les recommandations\n- Protection solaire obligatoire"
};

const CONSENT_TEXTS = {
  "Expérience thermale": "Je soussigné(e) consent à recevoir un traitement d'expérience thermale. Je comprends que ce traitement implique l'utilisation d'eau thermale et peut inclure des massages thérapeutiques.",
  "Bilan Santé": "Je soussigné(e) consent à la réalisation d'un bilan de santé complet. Je m'engage à fournir des informations précises sur mon état de santé actuel et mes antécédents médicaux.",
  "Médico-Esthéthique": "Je soussigné(e) consent à recevoir un traitement médico-esthétique. J'ai été informé(e) des risques potentiels et des résultats attendus.",
  "Poly": "Je soussigné(e) consent à recevoir un traitement poly-thérapeutique combinant plusieurs approches. Les différentes modalités de traitement m'ont été expliquées.",
  "Infusion": "Je soussigné(e) consent à recevoir un traitement par infusion. J'ai été informé(e) de la composition du produit et des effets attendus.",
  "Peeling chimique": "Je soussigné(e) consent à recevoir un peeling chimique. J'ai été informé(e) des précautions post-traitement à respecter et des possibles réactions cutanées.",
  "Vasculyse 2GRF": "Je soussigné(e) consent au traitement Vasculyse 2GRF. J'ai été informé(e) que ce traitement vise à réduire l'apparence des lésions vasculaires.",
  "Fractionnement/Raffermissement": "Je soussigné(e) consent au traitement de fractionnement et raffermissement. J'ai été informé(e) que plusieurs séances peuvent être nécessaires pour obtenir les résultats souhaités."
};

const CONSENT_TYPES = Object.keys(CONSENT_TEXTS);

export function ConsentForm({
  patientId,
  onComplete,
}: {
  patientId: Id<"patients">;
  onComplete: () => void;
}) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [doctorName, setDoctorName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");

  const patientSignatureRef = useRef<SignatureCanvas>(null);
  const doctorSignatureRef = useRef<SignatureCanvas>(null);

  const createConsent = useMutation(api.consents.create);

  // Générer le texte combiné basé sur les types sélectionnés
  const combinedText = selectedTypes
    .map(type => CONSENT_TEXTS[type as keyof typeof CONSENT_TEXTS])
    .join("\n\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientSignatureRef.current || !doctorSignatureRef.current) return;
    if (selectedTypes.length === 0) {
      alert("Veuillez sélectionner au moins un type de consentement");
      return;
    }

    const patientSignature = patientSignatureRef.current.toDataURL();
    const doctorSignature = doctorSignatureRef.current.toDataURL();

    await createConsent({
      patientId,
      types: selectedTypes,
      text: combinedText,
      doctorSignature,
      patientSignature,
      date: new Date().toISOString().split("T")[0],
      doctorName,
      additionalInfo,
      medications,
    });

    onComplete();
  };

  const addMedication = () => {
    if (newMedication) {
      setMedications([...medications, newMedication]);
      setNewMedication("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Types de consentement</h3>
        <div className="grid grid-cols-2 gap-2">
          {CONSENT_TYPES.map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTypes([...selectedTypes, type]);
                  } else {
                    setSelectedTypes(selectedTypes.filter((t) => t !== type));
                  }
                }}
                className="rounded"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedTypes.length > 0 && (
        <>
          <div>
            <h3 className="text-lg font-medium mb-2">Texte du consentement</h3>
            <div className="mt-1 p-4 w-full rounded-md border border-gray-300 bg-gray-50 whitespace-pre-wrap">
              {combinedText}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Instructions post-traitement</h3>
            <div className="space-y-4">
              {selectedTypes.map((type) => (
                <div key={type} className="p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">{type}</h4>
                  <pre className="whitespace-pre-wrap text-blue-800 text-sm font-normal">
                    {POST_TREATMENT_INSTRUCTIONS[type as keyof typeof POST_TREATMENT_INSTRUCTIONS]}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block font-medium mb-2">
          Nom du médecin
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </label>
      </div>

      <div>
        <label className="block font-medium mb-2">
          Informations additionnelles
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={2}
          />
        </label>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Médicaments</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm"
            placeholder="Nouveau médicament"
          />
          <button
            type="button"
            onClick={addMedication}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ajouter
          </button>
        </div>
        <ul className="list-disc list-inside">
          {medications.map((med, index) => (
            <li key={index} className="flex justify-between items-center">
              {med}
              <button
                type="button"
                onClick={() => setMedications(medications.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Signature du patient</h3>
          <div className="border rounded-md p-2 bg-white">
            <SignatureCanvas
              ref={patientSignatureRef}
              canvasProps={{
                className: "w-full h-40 border rounded",
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => patientSignatureRef.current?.clear()}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Effacer
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Signature du médecin</h3>
          <div className="border rounded-md p-2 bg-white">
            <SignatureCanvas
              ref={doctorSignatureRef}
              canvasProps={{
                className: "w-full h-40 border rounded",
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => doctorSignatureRef.current?.clear()}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Effacer
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onComplete}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
