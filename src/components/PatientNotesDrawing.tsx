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
  TLStoreSnapshot,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { blobToBase64 } from "../lib/blobToBase64";
import { getSvgAsImage } from "../lib/getSvgAsImage";

interface PatientNotesDrawingProps {
  patientId: Id<"patients">;
}

interface DrawingNote {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  snapshot?: TLStoreSnapshot;
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

// Utilitaires pour la gestion des notes
const getNotesStorageKey = (patientId: string) => `patient-notes-${patientId}`;

const saveNote = (patientId: string, note: DrawingNote) => {
  const key = getNotesStorageKey(patientId);
  const notes = loadNotes(patientId);
  const updatedNotes = notes.filter(n => n.id !== note.id);
  updatedNotes.push(note);
  localStorage.setItem(key, JSON.stringify(updatedNotes));
};

const loadNotes = (patientId: string): DrawingNote[] => {
  const key = getNotesStorageKey(patientId);
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const deleteNote = (patientId: string, noteId: string) => {
  const key = getNotesStorageKey(patientId);
  const notes = loadNotes(patientId);
  const filteredNotes = notes.filter(n => n.id !== noteId);
  localStorage.setItem(key, JSON.stringify(filteredNotes));
  
  // Supprimer aussi la persistance tldraw
  localStorage.removeItem(`tldraw-patient-notes-${patientId}-${noteId}`);
};

// Composant pour gérer les notes multiples
function NotesManager({ patientId, currentNoteId, onNoteChange }: {
  patientId: string;
  currentNoteId: string | null;
  onNoteChange: (noteId: string | null) => void;
}) {
  const [notes, setNotes] = useState<DrawingNote[]>([]);
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");

  useEffect(() => {
    setNotes(loadNotes(patientId));
  }, [patientId]);

  const createNewNote = () => {
    if (!newNoteName.trim()) return;
    
    const newNote: DrawingNote = {
      id: `note-${Date.now()}`,
      name: newNoteName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveNote(patientId, newNote);
    setNotes(loadNotes(patientId));
    setNewNoteName("");
    setShowNewNoteDialog(false);
    onNoteChange(newNote.id);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      deleteNote(patientId, noteId);
      setNotes(loadNotes(patientId));
      if (currentNoteId === noteId) {
        onNoteChange(null);
      }
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-800 text-sm">Notes:</h3>
        <select
          value={currentNoteId || ""}
          onChange={(e) => onNoteChange(e.target.value || null)}
          className="p-2 border border-gray-300 rounded text-sm min-w-[200px]"
        >
          <option value="">Nouvelle note temporaire</option>
          {notes.map((note) => (
            <option key={note.id} value={note.id}>
              {note.name} ({new Date(note.createdAt).toLocaleDateString()})
            </option>
          ))}
        </select>
        
        <button
          onClick={() => setShowNewNoteDialog(true)}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 whitespace-nowrap"
        >
          ➕ Nouvelle note
        </button>
        
        {currentNoteId && (
          <button
            onClick={() => handleDeleteNote(currentNoteId)}
            className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 whitespace-nowrap"
          >
            🗑️ Supprimer
          </button>
        )}
      </div>

      {showNewNoteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Créer une nouvelle note</h3>
            <input
              type="text"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              placeholder="Nom de la note..."
              className="w-full p-2 border border-gray-300 rounded mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createNewNote()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewNoteDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={createNewNote}
                disabled={!newNoteName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawingToolbarExternal({ patientId, currentNoteId }: { patientId: string; currentNoteId: string | null }) {
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
    const event = new CustomEvent('exportTldraw', { detail: { noteId: currentNoteId } });
    window.dispatchEvent(event);
  };

  const clearCanvas = () => {
    const event = new CustomEvent('clearTldraw');
    window.dispatchEvent(event);
  };

  const saveCurrentNote = () => {
    if (currentNoteId) {
      const event = new CustomEvent('saveTldrawNote', { detail: { noteId: currentNoteId } });
      window.dispatchEvent(event);
    }
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
        {currentNoteId && (
          <button
            onClick={saveCurrentNote}
            className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 whitespace-nowrap"
          >
            💾 Sauvegarder
          </button>
        )}
        
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
function TldrawEventHandler({ patientId }: { patientId: string }) {
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

    const handleExport = async (event: CustomEvent) => {
      try {
        editor.selectAll();
        const selectedIds = editor.getSelectedShapeIds();
        
        if (selectedIds.size === 0) {
          alert("Rien à exporter. Ajoutez du contenu au canevas d'abord.");
          return;
        }

        const shapeIds = Array.from(selectedIds);
        const { noteId } = event.detail || {};
        
        let filename = `patient-notes-${Date.now()}`;
        if (noteId) {
          const notes = loadNotes(patientId);
          const note = notes.find(n => n.id === noteId);
          if (note) {
            filename = `${note.name}-${new Date().toISOString().split('T')[0]}`;
          }
        }
        
        await exportAs(shapeIds, 'png', filename);
      } catch (error) {
        console.error("Error exporting:", error);
        alert("Erreur lors de l'exportation. Veuillez réessayer.");
      }
    };

    const handleSaveNote = async (event: CustomEvent) => {
      try {
        const { noteId } = event.detail;
        if (!noteId) return;

        const notes = loadNotes(patientId);
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        // Sauvegarder la note avec timestamp mis à jour
        const updatedNote = {
          ...note,
          updatedAt: new Date().toISOString(),
        };
        
        saveNote(patientId, updatedNote);
        alert("Note sauvegardée avec succès !");
      } catch (error) {
        console.error("Error saving note:", error);
        alert("Erreur lors de la sauvegarde.");
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
    window.addEventListener('exportTldraw', handleExport as EventListener);
    window.addEventListener('saveTldrawNote', handleSaveNote as EventListener);
    window.addEventListener('clearTldraw', handleClear);

    return () => {
      window.removeEventListener('addImageToTldraw', handleAddImage as EventListener);
      window.removeEventListener('exportTldraw', handleExport as EventListener);
      window.removeEventListener('saveTldrawNote', handleSaveNote as EventListener);
      window.removeEventListener('clearTldraw', handleClear);
    };
  }, [editor, exportAs, patientId]);

  return null;
}

export function PatientNotesDrawing({ patientId }: PatientNotesDrawingProps) {
  const patient = useQuery(api.patients.get, { id: patientId });
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const persistenceKey = currentNoteId 
    ? `tldraw-patient-notes-${patientId}-${currentNoteId}`
    : `tldraw-patient-notes-${patientId}-temp`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notes avec dessins pour {patient.name}</h3>
        <p className="text-sm text-gray-600">
          {currentNoteId ? "Note sauvegardée" : "Note temporaire"} - Utilisez les outils de dessin pour annoter
        </p>
      </div>

      {/* Gestionnaire de notes multiples */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <NotesManager 
          patientId={patientId} 
          currentNoteId={currentNoteId}
          onNoteChange={setCurrentNoteId}
        />
      </div>

      {/* Interface d'ajout d'images - extérieure au canvas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <DrawingToolbarExternal patientId={patientId} currentNoteId={currentNoteId} />
      </div>

      <div className="relative w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
        <Tldraw
          key={persistenceKey} // Force re-render quand on change de note
          persistenceKey={persistenceKey}
          autoFocus={false}
        >
          <TldrawEventHandler patientId={patientId} />
        </Tldraw>
      </div>
    </div>
  );
}