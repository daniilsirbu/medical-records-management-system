import { useState } from "react";
import { BodyAnnotator } from "./BodyAnnotator";
import { FollowUpList } from "./FollowUpList";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function MedicalFollowUp({
  patientId,
  onComplete,
}: {
  patientId: Id<"patients">;
  onComplete?: () => void;
}) {
  const [showNewFollowUp, setShowNewFollowUp] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Suivi Médical</h3>
        <button
          onClick={() => setShowNewFollowUp(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Nouveau Suivi
        </button>
      </div>

      {showNewFollowUp ? (
        <BodyAnnotator
          patientId={patientId}
          onComplete={() => {
            setShowNewFollowUp(false);
            onComplete?.();
          }}
        />
      ) : (
        <FollowUpList patientId={patientId} />
      )}
    </div>
  );
}
