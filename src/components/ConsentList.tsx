import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function ConsentList({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const consents = useQuery(api.consents.list, { patientId });

  if (!consents) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {consents.map((consent) => (
        <div key={consent._id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">Types de consentement:</h3>
              <ul className="list-disc list-inside">
                {consent.types.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-gray-500">{consent.date}</div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Texte du consentement:</h4>
            <p className="whitespace-pre-wrap">{consent.text}</p>
          </div>

          {consent.medications && consent.medications.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium">Médicaments:</h4>
              <ul className="list-disc list-inside">
                {consent.medications.map((med, index) => (
                  <li key={index}>{med}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Signature du patient:</h4>
              <img
                src={consent.patientSignature}
                alt="Signature du patient"
                className="border rounded"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">
                Signature du médecin ({consent.doctorName}):
              </h4>
              <img
                src={consent.doctorSignature}
                alt="Signature du médecin"
                className="border rounded"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
