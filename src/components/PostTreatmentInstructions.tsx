import { useState } from "react";

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

const TREATMENT_TYPES = Object.keys(POST_TREATMENT_INSTRUCTIONS);

export function PostTreatmentInstructions({ patientId }: { patientId: any }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Sélectionnez un type de traitement</h3>
        <div className="grid grid-cols-2 gap-4">
          {TREATMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-3 text-left rounded-lg transition-colors ${
                selectedType === type
                  ? "bg-blue-100 border-blue-500 border-2"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {selectedType && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Instructions pour {selectedType}</h3>
          <div className="p-4 bg-blue-50 rounded-lg">
            <pre className="whitespace-pre-wrap text-blue-800 text-sm font-normal">
              {POST_TREATMENT_INSTRUCTIONS[selectedType as keyof typeof POST_TREATMENT_INSTRUCTIONS]}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
