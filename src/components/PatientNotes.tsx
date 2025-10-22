import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const NOTE_CATEGORIES = [
  "Général",
  "Médical",
  "Traitement",
  "Suivi",
  "Administratif",
  "Import",
  "Autre",
];

export function PatientNotes({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const [showNewNote, setShowNewNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Id<"patientNotes"> | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const notes = useQuery(api.patientNotes.list, { patientId }) || [];
  const createNote = useMutation(api.patientNotes.create);
  const updateNote = useMutation(api.patientNotes.update);
  const removeNote = useMutation(api.patientNotes.remove);

  // Filtrer les notes par catégorie
  const filteredNotes = selectedCategory === "all" 
    ? notes 
    : notes.filter(note => note.category === selectedCategory);

  // Grouper les notes par catégorie
  const notesByCategory = notes.reduce((acc, note) => {
    const cat = note.category || "Non catégorisé";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      await updateNote({
        noteId: editingNote,
        title: title.trim(),
        content: content.trim(),
        category: category || undefined,
      });
      setEditingNote(null);
    } else {
      await createNote({
        patientId,
        title: title.trim(),
        content: content.trim(),
        category: category || undefined,
      });
      setShowNewNote(false);
    }

    // Réinitialiser le formulaire
    setTitle("");
    setContent("");
    setCategory("");
  };

  const handleEdit = (note: typeof notes[0]) => {
    setEditingNote(note._id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || "");
    setShowNewNote(true);
  };

  const handleCancel = () => {
    setShowNewNote(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
    setCategory("");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Notes du patient</h3>
        <button
          onClick={() => setShowNewNote(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Nouvelle Note
        </button>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedCategory === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Toutes ({notes.length})
        </button>
        {Object.entries(notesByCategory).map(([cat, catNotes]) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === cat
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat} ({catNotes.length})
          </button>
        ))}
      </div>

      {/* Formulaire de nouvelle note / édition */}
      {showNewNote && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-lg font-medium mb-4">
            {editingNote ? "Modifier la note" : "Nouvelle note"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Titre de la note..."
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {NOTE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Contenu</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm"
                rows={6}
                placeholder="Contenu de la note..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingNote ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des notes */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {selectedCategory === "all" 
              ? "Aucune note pour ce patient" 
              : `Aucune note dans la catégorie "${selectedCategory}"`
            }
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note._id}
              className={`border rounded-lg p-4 ${
                note.isImportNote ? "bg-blue-50 border-blue-200" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-lg">{note.title}</h4>
                  {note.category && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      note.category === "Import" 
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {note.category}
                    </span>
                  )}
                  {note.isImportNote && (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Importé
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(note._creationTime)}
                  </span>
                  {!note.isImportNote && (
                    <>
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => removeNote({ noteId: note._id })}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="whitespace-pre-wrap text-gray-700">
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
