import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Photo {
  _id: Id<"photos">;
  patientId: Id<"patients">;
  date: string;
  description?: string;
  storageId: Id<"_storage">;
  url?: string | null;
}

export function BeforeAfterPhotos({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos = useQuery(api.photos.list, { patientId }) || [];
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const createPhoto = useMutation(api.photos.create);
  const removePhoto = useMutation(api.photos.remove);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    await createPhoto({
      patientId,
      date,
      description,
      storageId,
    });

    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePhotoSelect = (photo: Photo) => {
    if (selectedPhotos.find(p => p._id === photo._id)) {
      setSelectedPhotos(selectedPhotos.filter(p => p._id !== photo._id));
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos([...selectedPhotos, photo]);
    } else {
      setSelectedPhotos([selectedPhotos[1], photo]);
    }
  };

  const sortedPhotos = photos.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (showComparison && selectedPhotos.length === 2) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Comparaison de photos</h3>
          <button
            onClick={() => setShowComparison(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Retour
          </button>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {selectedPhotos.map((photo, index) => (
            <div key={photo._id} className="space-y-2">
              <div className="text-center">
                <h4 className="font-medium">Photo {index + 1}</h4>
                <p className="text-sm text-gray-600">
                  {photo.date}
                </p>
                {photo.description && (
                  <p className="text-sm text-gray-600">{photo.description}</p>
                )}
              </div>
              <img
                src={photo.url || undefined}
                alt={photo.description || `Photo ${index + 1}`}
                className="w-full h-auto rounded-lg border shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-medium mb-4">Ajouter des photos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Description de la photo..."
            />
          </div>
        </div>
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      {selectedPhotos.length > 0 && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Photos sélectionnées pour comparaison</h3>
              <p className="text-sm text-gray-600">
                {selectedPhotos.length}/2 photos sélectionnées
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedPhotos([])}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Effacer
              </button>
              {selectedPhotos.length === 2 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Comparer
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            {selectedPhotos.map((photo, index) => (
              <div key={photo._id} className="text-center">
                <img
                  src={photo.url || undefined}
                  alt={`Sélection ${index + 1}`}
                  className="w-20 h-20 object-cover rounded border"
                />
                <p className="text-xs mt-1">{photo.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Toutes les photos</h3>
        <p className="text-sm text-gray-600">
          Cliquez sur les photos pour les sélectionner pour comparaison (max 2)
        </p>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sortedPhotos.map((photo) => {
            const isSelected = selectedPhotos.find(p => p._id === photo._id);
            return (
              <div key={photo._id} className="relative group">
                <div
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => handlePhotoSelect(photo)}
                >
                  <img
                    src={photo.url || undefined}
                    alt={photo.description || "Photo"}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs text-gray-600">{photo.date}</p>
                    {photo.description && (
                      <p className="text-xs text-gray-600 truncate">
                        {photo.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {selectedPhotos.findIndex(p => p._id === photo._id) + 1}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto({ photoId: photo._id });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
