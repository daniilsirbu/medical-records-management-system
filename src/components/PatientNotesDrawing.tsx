import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Tldraw,
  TLImageShape,
  useEditor,
  Editor,
  createShapeId,
  AssetRecordType,
  useExportAs,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { blobToBase64 } from "../lib/blobToBase64";
import { getSvgAsImage } from "../lib/getSvgAsImage";

interface PatientNotesDrawingProps {
  patientId: Id<"patients">;
}

const NOTES_PICTURES = [
  { name: "Corps masculin", file: "body_male.png" },
  { name: "Corps féminin", file: "body_female.png" },
  { name: "Visage face", file: "face_front.png" },
  { name: "Visage face 2", file: "face_front2.png" },
  { name: "Visage profil", file: "face_side.png" },
  { name: "Cou", file: "neck.png" },
  { name: "Aisselle", file: "armpit.png" },
];

// Hook personnalisé pour accéder à l'éditeur depuis l'extérieur
function useExternalTldrawEditor(patientId: string) {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    // Attendre que l'éditeur soit disponible
    const checkForEditor = () => {
      const tldrawInstance = document.querySelector(`[data-testid="tldraw"]`);
      if (tldrawInstance && (window as any).tldrawEditor) {
        setEditor((window as any).tldrawEditor);
      }
    };

    const interval = setInterval(checkForEditor, 100);
    return () => clearInterval(interval);
  }, [patientId]);

  return editor;
}

function DrawingToolbarExternal({ patientId }: { patientId: string }) {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const addImageToCanvas = async (imagePath: string) => {
    if (!imagePath) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/${imagePath}`);
      const blob = await response.blob();
      const dataUrl = (await blobToBase64(blob)) as string;

      // Créer un événement personnalisé pour communiquer avec le canvas
      const event = new CustomEvent('addImageToTldraw', {
        detail: { imagePath, dataUrl, blob }
      });
      window.dispatchEvent(event);
      
      setSelectedImage("");
    } catch (error) {
      console.error("Error loading image:", error);
      alert("Erreur lors du chargement de l'image.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportDrawing = () => {
    const event = new CustomEvent('exportTldraw');
    window.dispatchEvent(event);
  };

  const clearCanvas = () => {
    const event = new CustomEvent('clearTldraw');
    window.dispatchEvent(event);
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-800 text-sm">Images anatomiques:</h3>
        <select
          value={selectedImage}
          onChange={(e) => setSelectedImage(e.target.value)}
          className="p-2 border border-gray-300 rounded text-sm min-w-[180px]"
          disabled={isLoading}
        >
          <option value="">Sélectionner une image...</option>
          {NOTES_PICTURES.map((img) => (
            <option key={img.file} value={img.file}>
              {img.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => addImageToCanvas(selectedImage)}
          disabled={!selectedImage || isLoading}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? "⏳ Chargement..." : "Ajouter"}
        </button>
      </div>

      <div className="flex items-center gap-2 border-l pl-4">
        <button
          onClick={exportDrawing}
          className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 whitespace-nowrap"
        >
          📥 Exporter PNG
        </button>
        
        <button
          onClick={clearCanvas}
          className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 whitespace-nowrap"
        >
          🗑️ Effacer tout
        </button>
      </div>
    </div>
  );
}

// Composant interne pour gérer les événements dans le canvas
function TldrawEventHandler() {
  const editor = useEditor();
  const exportAs = useExportAs();

  useEffect(() => {
    if (!editor) return;

    const handleAddImage = async (event: CustomEvent) => {
      const { imagePath, dataUrl, blob } = event.detail;
      
      try {
        const assetId = AssetRecordType.createId();
        
        const image = new Image();
        image.onload = () => {
          const asset = AssetRecordType.create({
            id: assetId,
            type: "image",
            typeName: "asset",
            props: {
              name: imagePath,
              src: dataUrl,
              w: image.naturalWidth,
              h: image.naturalHeight,
              mimeType: blob.type,
              isAnimated: false,
            },
            meta: {},
          });

          editor.createAssets([asset]);

          const shapeId = createShapeId();
          editor.createShape<TLImageShape>({
            id: shapeId,
            type: "image",
            x: 100,
            y: 100,
            props: {
              assetId,
              w: Math.min(400, image.naturalWidth),
              h: Math.min(400, image.naturalHeight),
            },
          });

          editor.zoomToFit();
        };
        
        image.src = dataUrl;
      } catch (error) {
        console.error("Error adding image:", error);
      }
    };

    const handleExport = async () => {
      try {
        editor.selectAll();
        const selectedIds = editor.getSelectedShapeIds();
        
        if (selectedIds.size === 0) {
          alert("Rien à exporter. Ajoutez du contenu au canevas d'abord.");
          return;
        }

        const shapeIds = Array.from(selectedIds);
        await exportAs(shapeIds, 'png', `patient-notes-${Date.now()}`);
      } catch (error) {
        console.error("Error exporting:", error);
        alert("Erreur lors de l'exportation. Veuillez réessayer.");
      }
    };

    const handleClear = () => {
      try {
        editor.selectAll();
        editor.deleteShapes(editor.getSelectedShapeIds());
      } catch (error) {
        console.error("Error clearing canvas:", error);
      }
    };

    window.addEventListener('addImageToTldraw', handleAddImage as EventListener);
    window.addEventListener('exportTldraw', handleExport);
    window.addEventListener('clearTldraw', handleClear);

    return () => {
      window.removeEventListener('addImageToTldraw', handleAddImage as EventListener);
      window.removeEventListener('exportTldraw', handleExport);
      window.removeEventListener('clearTldraw', handleClear);
    };
  }, [editor, exportAs]);

  return null;
}

export function PatientNotesDrawing({ patientId }: PatientNotesDrawingProps) {
  const patient = useQuery(api.patients.get, { id: patientId });

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notes avec dessins pour {patient.name}</h3>
        <p className="text-sm text-gray-600">
          Utilisez les outils de dessin pour annoter les images anatomiques
        </p>
      </div>

      {/* Interface d'ajout d'images - extérieure au canvas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <DrawingToolbarExternal patientId={patientId} />
      </div>

      <div className="relative w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
        <Tldraw
          persistenceKey={`patient-notes-${patientId}`}
          autoFocus={false}
        >
          <TldrawEventHandler />
        </Tldraw>
      </div>
    </div>
  );
}