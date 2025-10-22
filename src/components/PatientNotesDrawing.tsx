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

function DrawingToolbar() {
  const editor = useEditor();
  const [selectedImage, setSelectedImage] = useState<string>("");

  const addImageToCanvas = async (imagePath: string) => {
    if (!editor) return;

    try {
      const response = await fetch(`/${imagePath}`);
      const blob = await response.blob();
      const dataUrl = (await blobToBase64(blob)) as string;

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
      console.error("Error loading image:", error);
    }
  };

  const exportDrawing = async () => {
    if (!editor) return;

    try {
      const svg = await editor.getSvg();
      if (!svg) return;

      const png = await getSvgAsImage(svg, {
        type: "png",
        quality: 1,
        scale: 1,
      });

      if (png) {
        const dataUrl = await blobToBase64(png);
        const link = document.createElement("a");
        link.href = dataUrl as string;
        link.download = `patient-notes-${Date.now()}.png`;
        link.click();
      }
    } catch (error) {
      console.error("Error exporting drawing:", error);
    }
  };

  const clearCanvas = () => {
    if (!editor) return;
    editor.selectAll();
    editor.deleteShapes(editor.getSelectedShapeIds());
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 space-y-4 max-w-xs">
      <h3 className="font-semibold text-gray-800">Images anatomiques</h3>
      
      <div className="space-y-2">
        <select
          value={selectedImage}
          onChange={(e) => setSelectedImage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="">Sélectionner une image...</option>
          {NOTES_PICTURES.map((img) => (
            <option key={img.file} value={img.file}>
              {img.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => selectedImage && addImageToCanvas(selectedImage)}
          disabled={!selectedImage}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Ajouter à la toile
        </button>
      </div>

      <div className="border-t pt-4 space-y-2">
        <button
          onClick={exportDrawing}
          className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Exporter PNG
        </button>
        
        <button
          onClick={clearCanvas}
          className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Effacer tout
        </button>
      </div>
    </div>
  );
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

      <div className="relative w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
        <Tldraw
          persistenceKey={`patient-notes-${patientId}`}
          autoFocus={false}
        >
          <DrawingToolbar />
        </Tldraw>
      </div>

      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium mb-2">Instructions:</p>
        <ul className="space-y-1">
          <li>• Sélectionnez une image anatomique dans le menu déroulant</li>
          <li>• Utilisez les outils de dessin pour annoter les zones d'intérêt</li>
          <li>• Exportez vos notes en format PNG pour les sauvegarder</li>
          <li>• Vos dessins sont automatiquement sauvegardés dans le navigateur</li>
        </ul>
      </div>
    </div>
  );
}