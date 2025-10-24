import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { blobToBase64 } from "../lib/blobToBase64";
import { getSvgAsImage } from "../lib/getSvgAsImage";

// Chargement dynamique complet de Tldraw et ses composants
const TldrawCanvas = lazy(() => 
  import("@tldraw/tldraw").then((module) => ({ 
    default: function TldrawCanvasComponent({ 
      persistenceKey, 
      patientId, 
      initialData, 
      onDataChange 
    }: { 
      persistenceKey: string, 
      patientId: string,
      initialData?: string,
      onDataChange?: (data: string) => void
    }) {
      const { Tldraw, useEditor, useExportAs, createShapeId, AssetRecordType } = module;
      
      // Gestionnaire d'événements intégré
      function TldrawEventHandler() {
        const editor = useEditor();
        const exportAs = useExportAs();

        // Load initial data when editor is ready
        useEffect(() => {
          if (!editor || !initialData) return;
          
          try {
            const parsedData = JSON.parse(initialData);
            const records = Object.values(parsedData);
            if (records.length > 0) {
              editor.store.put(records);
            }
          } catch (error) {
            console.error("Error loading initial data:", error);
          }
        }, [editor, initialData]);

        // Auto-save changes
        useEffect(() => {
          if (!editor || !onDataChange) return;

          const handleChange = () => {
            try {
              const snapshot = editor.store.serialize();
              const serialized = JSON.stringify(snapshot);
              onDataChange(serialized);
            } catch (error) {
              console.error("Error auto-saving:", error);
            }
          };

          // Debounce the auto-save
          let timeoutId: NodeJS.Timeout;
          const debouncedSave = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleChange, 1000); // Save after 1 second of inactivity
          };

          const unsubscribe = editor.store.listen(debouncedSave);
          
          return () => {
            unsubscribe();
            clearTimeout(timeoutId);
          };
        }, [editor, onDataChange]);

        useEffect(() => {
          if (!editor) return;

          const handleAddImage = async (event: CustomEvent) => {
            const { imagePath, dataUrl, blob, isAnatomical = true, isClientPhoto = false } = event.detail;
            
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
                const imageShape = {
                  id: shapeId,
                  type: "image",
                  x: 100,
                  y: 100,
                  props: {
                    assetId,
                    w: Math.min(400, image.naturalWidth),
                    h: Math.min(400, image.naturalHeight),
                  },
                  isLocked: isAnatomical, // Lock based on image type
                  meta: {
                    isAnatomicalImage: !isClientPhoto,
                    isClientPhoto: isClientPhoto,
                    originalName: imagePath,
                  },
                };

                editor.createShape(imageShape);
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
                // For export, we can use the noteId directly to construct a meaningful filename
                filename = `drawing-note-${noteId}-${new Date().toISOString().split('T')[0]}`;
              }
              
              await exportAs(shapeIds, 'png', filename);
            } catch (error) {
              console.error("Error exporting:", error);
              alert("Erreur lors de l'exportation. Veuillez réessayer.");
            }
          };

          const handleSaveNote = async (event: CustomEvent) => {
            try {
              const { noteId, updateNoteMutation } = event.detail;
              if (!noteId || !updateNoteMutation) return;

              // Get the current tldraw data using the correct API
              const snapshot = editor.store.serialize();
              const tldrawData = JSON.stringify(snapshot);

              // Update the note in Convex with the tldraw data
              await updateNoteMutation({
                id: noteId,
                tldrawData,
              });
              
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

          const handleToggleLock = (event: CustomEvent) => {
            try {
              const selectedShapes = editor.getSelectedShapes();
              if (selectedShapes.length === 0) {
                alert("Sélectionnez d'abord les éléments à verrouiller/déverrouiller");
                return;
              }

              selectedShapes.forEach(shape => {
                const isCurrentlyLocked = shape.isLocked;
                editor.updateShape({
                  id: shape.id,
                  type: shape.type,
                  isLocked: !isCurrentlyLocked,
                });
              });

              const action = selectedShapes[0].isLocked ? "déverrouillés" : "verrouillés";
              alert(`Éléments ${action} avec succès`);
            } catch (error) {
              console.error("Error toggling lock:", error);
            }
          };

          const handleLockAnatomicalImages = () => {
            try {
              const allShapes = editor.getCurrentPageShapes();
              const anatomicalImages = allShapes.filter(shape => 
                shape.type === "image" && shape.meta?.isAnatomicalImage
              );

              anatomicalImages.forEach(shape => {
                editor.updateShape({
                  id: shape.id,
                  type: shape.type,
                  isLocked: true,
                });
              });

              if (anatomicalImages.length > 0) {
                alert(`${anatomicalImages.length} image(s) anatomique(s) verrouillée(s)`);
              } else {
                alert("Aucune image anatomique trouvée");
              }
            } catch (error) {
              console.error("Error locking anatomical images:", error);
            }
          };

          window.addEventListener('addImageToTldraw', handleAddImage as EventListener);
          window.addEventListener('exportTldraw', handleExport as EventListener);
          window.addEventListener('saveTldrawNote', handleSaveNote as EventListener);
          window.addEventListener('clearTldraw', handleClear);
          window.addEventListener('toggleLockTldraw', handleToggleLock as EventListener);
          window.addEventListener('lockAnatomicalImages', handleLockAnatomicalImages);

          return () => {
            window.removeEventListener('addImageToTldraw', handleAddImage as EventListener);
            window.removeEventListener('exportTldraw', handleExport as EventListener);
            window.removeEventListener('saveTldrawNote', handleSaveNote as EventListener);
            window.removeEventListener('clearTldraw', handleClear);
            window.removeEventListener('toggleLockTldraw', handleToggleLock as EventListener);
            window.removeEventListener('lockAnatomicalImages', handleLockAnatomicalImages);
          };
        }, [editor, exportAs, patientId]);

        return null;
      }

      return (
        <Tldraw
          key={persistenceKey}
          persistenceKey={undefined} // Disable automatic persistence
          autoFocus={false}
          licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY}
        >
          <TldrawEventHandler />
        </Tldraw>
      );
    }
  }))
);

// Charger les styles de manière dynamique
const loadTldrawStyles = () => {
  if (typeof window !== 'undefined' && !document.querySelector('link[href*="tldraw.css"]')) {
    import("@tldraw/tldraw/tldraw.css");
  }
};

interface PatientNotesDrawingProps {
  patientId: Id<"patients">;
}

interface DrawingNote {
  _id: Id<"drawingNotes">;
  patientId: Id<"patients">;
  name: string;
  tldrawData?: string;
  createdAt: string;
  updatedAt: string;
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


// Composant pour gérer les notes multiples
function NotesManager({ patientId, currentNoteId, onNoteChange }: {
  patientId: Id<"patients">;
  currentNoteId: Id<"drawingNotes"> | null;
  onNoteChange: (noteId: Id<"drawingNotes"> | null) => void;
}) {
  const notes = useQuery(api.drawingNotes.list, { patientId }) || [];
  const createNote = useMutation(api.drawingNotes.create);
  const deleteNote = useMutation(api.drawingNotes.remove);
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");

  const createNewNote = async () => {
    if (!newNoteName.trim()) return;
    
    try {
      const newNoteId = await createNote({
        patientId,
        name: newNoteName.trim(),
      });
      
      setNewNoteName("");
      setShowNewNoteDialog(false);
      onNoteChange(newNoteId);
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Erreur lors de la création de la note.");
    }
  };

  const handleDeleteNote = async (noteId: Id<"drawingNotes">) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      try {
        await deleteNote({ id: noteId });
        
        // Supprimer aussi la persistance tldraw locale
        localStorage.removeItem(`tldraw-patient-notes-${patientId}-${noteId}`);
        
        if (currentNoteId === noteId) {
          onNoteChange(null);
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Erreur lors de la suppression de la note.");
      }
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-800 text-sm">Notes:</h3>
        <select
          value={currentNoteId || ""}
          onChange={(e) => onNoteChange(e.target.value as Id<"drawingNotes"> || null)}
          className="p-2 border border-gray-300 rounded text-sm min-w-[200px]"
        >
          <option value="">Nouvelle note temporaire</option>
          {notes.map((note) => (
            <option key={note._id} value={note._id}>
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

function DrawingToolbarExternal({ patientId, currentNoteId }: { patientId: Id<"patients">; currentNoteId: Id<"drawingNotes"> | null }) {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showPhotopicker, setShowPhotopicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const updateNote = useMutation(api.drawingNotes.update);
  const clientPhotos = useQuery(api.photos.list, { patientId }) || [];

  const addImageToCanvas = async (imagePath: string) => {
    if (!imagePath) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/${imagePath}`);
      const blob = await response.blob();
      const dataUrl = (await blobToBase64(blob)) as string;

      // Créer un événement personnalisé pour communiquer avec le canvas
      const event = new CustomEvent('addImageToTldraw', {
        detail: { imagePath, dataUrl, blob, isAnatomical: true }
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

  const addClientPhotoToCanvas = async (photo: any) => {
    setIsLoading(true);
    try {
      // Use the URL provided by Convex API
      if (!photo.url) {
        alert("URL de la photo introuvable.");
        return;
      }
      
      // Fetch the image to convert to blob
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const dataUrl = (await blobToBase64(blob)) as string;

      // Create custom event to communicate with canvas
      const event = new CustomEvent('addImageToTldraw', {
        detail: { 
          imagePath: photo.description || `Photo ${photo.date}`, 
          dataUrl, 
          blob,
          isAnatomical: true, // Lock the photo
          isClientPhoto: true // Mark as client photo
        }
      });
      window.dispatchEvent(event);
      
      setShowPhotopicker(false);
    } catch (error) {
      console.error("Error loading client photo:", error);
      alert("Erreur lors du chargement de la photo client.");
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
      const event = new CustomEvent('saveTldrawNote', { 
        detail: { 
          noteId: currentNoteId,
          updateNoteMutation: updateNote
        } 
      });
      window.dispatchEvent(event);
    }
  };

  const toggleLockSelected = () => {
    const event = new CustomEvent('toggleLockTldraw');
    window.dispatchEvent(event);
  };

  const lockAllAnatomicalImages = () => {
    const event = new CustomEvent('lockAnatomicalImages');
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
        <h3 className="font-semibold text-gray-800 text-sm">Photos client:</h3>
        <button
          onClick={() => setShowPhotopicker(true)}
          disabled={isLoading || clientPhotos.length === 0}
          className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
        >
          📷 Choisir photo ({clientPhotos.length})
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

{/* 
      <div className="flex items-center gap-2 border-l pl-4">
        <button
          onClick={toggleLockSelected}
          className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 whitespace-nowrap"
        >
          🔒 Verrouiller/Déverrouiller
        </button>
        
        <button
          onClick={lockAllAnatomicalImages}
          className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 whitespace-nowrap"
        >
          🔐 Protéger images anatomiques
        </button>
      </div>
*/}

      {/* Photo Picker Modal */}
      {showPhotopicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Choisir une photo client</h3>
              <button
                onClick={() => setShowPhotopicker(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            {clientPhotos.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Aucune photo trouvée pour ce patient.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clientPhotos.map((photo) => {
                  return (
                    <div
                      key={photo._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => addClientPhotoToCanvas(photo)}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.description || "Photo client"}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjM0IDkgOSAxMC4zNCA5IDEyQzkgMTMuNjYgMTAuMzQgMTUgMTIgMTVDMTMuNjYgMTUgMTUgMTMuNjYgMTUgMTJDMTUgMTAuMzQgMTMuNjYgOSAxMiA5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">
                          {photo.description || "Sans description"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(photo.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPhotopicker(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Composant de chargement pour le canvas
function TldrawLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement du canvas de dessin...</p>
      </div>
    </div>
  );
}

// Composant d'erreur pour le canvas
function TldrawErrorFallback({ error, retry }: { error: Error, retry: () => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200">
      <div className="text-center p-6">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement du canvas</h3>
        <p className="text-red-600 text-sm mb-4">
          Le canvas de dessin n'a pas pu se charger correctement.
        </p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

// Wrapper pour le canvas Tldraw avec gestion d'erreurs
function TldrawWrapper({ 
  patientId, 
  persistenceKey, 
  initialData, 
  onDataChange 
}: { 
  patientId: string, 
  persistenceKey: string,
  initialData?: string,
  onDataChange?: (data: string) => void
}) {
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // S'assurer qu'on est côté client
    setIsClient(true);
    // Charger les styles Tldraw
    loadTldrawStyles();
  }, []);

  useEffect(() => {
    // Reset l'erreur quand la persistenceKey change
    setHasError(false);
  }, [persistenceKey]);

  const handleRetry = () => {
    setHasError(false);
  };

  if (!isClient) {
    return <TldrawLoadingFallback />;
  }

  if (hasError) {
    return <TldrawErrorFallback error={new Error("Canvas failed to load")} retry={handleRetry} />;
  }

  return (
    <Suspense fallback={<TldrawLoadingFallback />}>
      <ErrorBoundary onError={() => setHasError(true)}>
        <TldrawCanvas 
          persistenceKey={persistenceKey} 
          patientId={patientId}
          initialData={initialData}
          onDataChange={onDataChange}
        />
      </ErrorBoundary>
    </Suspense>
  );
}

// Error Boundary simple
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // L'erreur sera gérée par le parent
    }

    return this.props.children;
  }
}

export function PatientNotesDrawing({ patientId }: PatientNotesDrawingProps) {
  const patient = useQuery(api.patients.get, { id: patientId });
  const [currentNoteId, setCurrentNoteId] = useState<Id<"drawingNotes"> | null>(null);
  const currentNote = useQuery(api.drawingNotes.get, currentNoteId ? { id: currentNoteId } : "skip");
  const updateNote = useMutation(api.drawingNotes.update);

  // Handle drawing data changes with debouncing
  const handleDataChange = useCallback(
    async (data: string) => {
      if (!currentNoteId) return;
      
      try {
        await updateNote({
          id: currentNoteId,
          tldrawData: data,
        });
      } catch (error) {
        console.error("Error auto-saving drawing:", error);
      }
    },
    [currentNoteId, updateNote]
  );

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
        <TldrawWrapper 
          patientId={patientId} 
          persistenceKey={persistenceKey}
          initialData={currentNote?.tldrawData}
          onDataChange={handleDataChange}
        />
      </div>
    </div>
  );
}