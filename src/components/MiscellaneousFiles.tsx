import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const FILE_CATEGORIES = [
  "Analyses médicales",
  "Radiographies",
  "Ordonnances",
  "Rapports médicaux",
  "Factures",
  "Correspondance",
  "Autres",
];

export function MiscellaneousFiles({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files = useQuery(api.miscFiles.list, { patientId }) || [];
  const generateUploadUrl = useMutation(api.miscFiles.generateUploadUrl);
  const createFile = useMutation(api.miscFiles.create);
  const removeFile = useMutation(api.miscFiles.remove);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each selected file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Générer une URL de téléchargement
      const postUrl = await generateUploadUrl();

      // Télécharger le fichier
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Créer l'entrée dans la base de données
      await createFile({
        patientId,
        fileName: file.name,
        fileType: file.type,
        description,
        category: category || undefined,
        storageId,
      });
    }

    // Réinitialiser le formulaire
    setDescription("");
    setCategory("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Grouper les fichiers par catégorie
  const filesByCategory = files.reduce((acc, file) => {
    const cat = file.category || "Non catégorisé";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(file);
    return acc;
  }, {} as Record<string, typeof files>);

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-medium mb-4">Ajouter un fichier</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Sélectionner une catégorie</option>
              {FILE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Description du fichier..."
            />
          </div>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-600 mt-1">
            Vous pouvez sélectionner plusieurs fichiers à la fois. Ils auront tous la même description et catégorie.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(filesByCategory).map(([categoryName, categoryFiles]) => (
          <div key={categoryName} className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">{categoryName}</h3>
            <div className="grid gap-4">
              {categoryFiles.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                    <div>
                      <div className="font-medium">{file.fileName}</div>
                      {file.description && (
                        <div className="text-sm text-gray-600">{file.description}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        Ajouté le {file.uploadDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Ouvrir
                      </a>
                    )}
                    <button
                      onClick={() => removeFile({ fileId: file._id })}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Aucun fichier ajouté pour ce patient
        </div>
      )}
    </div>
  );
}
