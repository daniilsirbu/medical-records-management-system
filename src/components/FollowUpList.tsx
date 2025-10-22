import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function FollowUpList({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const followUps = useQuery(api.followUps.list, { patientId });

  if (!followUps) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {followUps.map((followUp) => (
        <div key={followUp._id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm text-gray-500">{followUp.date}</div>
          </div>

          <div className="mb-4">
            <img
              src={followUp.bodyAnnotation}
              alt="Annotation du corps"
              className="max-w-full h-auto rounded border"
            />
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Notes:</h4>
            <p className="whitespace-pre-wrap">{followUp.notes}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
