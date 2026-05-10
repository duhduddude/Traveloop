"use client";

import { useState, use, useEffect } from "react";
import { useNotes } from "@/lib/useNotes";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  day: string;
  stop?: string;
  createdAt: string;
}

const cityToTripId: Record<string, string> = {
  delhi: "delhi-trip-001",
  mumbai: "mumbai-trip-001",
  paris: "paris-trip-001",
};

export default function JournalPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = use(params);
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const tripId = cityToTripId[city.toLowerCase()] || null;
  
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes(tripId);

  // Add initial mock data if no notes exist
  useEffect(() => {
    if (!loading && notes.length === 0 && tripId) {
      const mockNotes = city === 'delhi' ? [
        { title: "First Day Adventure", content: "Visited the India Gate today. The weather was amazing and the crowd was less than expected. Took some great photos!", day: "Day 1", stop: "India Gate" },
        { title: "Red Fort Exploration", content: "Spent the entire morning at Red Fort. The architecture is breathtaking. Learned so much about the history.", day: "Day 2", stop: "Red Fort" },
        { title: "Street Food Experience", content: "Tried the famous chaat at Chandni Chowk. Absolutely delicious! The flavors were incredible.", day: "Day 2", stop: "Chandni Chowk" },
        { title: "Qutub Minar Sunset", content: "Watched the sunset from Qutub Minar. The view was spectacular. Highly recommend visiting during golden hour.", day: "Day 3", stop: "Qutub Minar" },
      ] : city === 'mumbai' ? [
        { title: "Gateway of India", content: "Visited the iconic Gateway of India. The architecture is stunning and the sea views are amazing!", day: "Day 1", stop: "Gateway of India" },
        { title: "Marine Drive Morning", content: "Early morning walk at Marine Drive was refreshing. The city wakes up beautifully!", day: "Day 2", stop: "Marine Drive" },
        { title: "Juhu Beach Sunset", content: "Watched a beautiful sunset at Juhu Beach. The street food nearby is a must-try!", day: "Day 3", stop: "Juhu Beach" },
      ] : [
        { title: "Eiffel Tower Visit", content: "First sight of the Eiffel Tower was breathtaking! Took amazing photos from Trocadéro.", day: "Day 1", stop: "Eiffel Tower" },
        { title: "Louvre Museum", content: "Spent hours exploring the Louvre. Saw the Mona Lisa and so much more. Absolutely mind-blowing!", day: "Day 2", stop: "Louvre Museum" },
        { title: "Seine River Cruise", content: "Evening cruise along the Seine was romantic and peaceful. Saw the city lights!", day: "Day 2", stop: "Seine River" },
        { title: "Montmartre Exploration", content: "Explored the charming streets of Montmartre. Found a great café with the best croissant!", day: "Day 3", stop: "Montmartre" },
      ];

      mockNotes.forEach(async (note) => {
        await addNote({
          tripId,
          title: note.title,
          content: note.content,
          day: note.day,
          stop: note.stop,
        });
      });
    }
  }, [loading, notes.length, tripId, city]);

  const entries: JournalEntry[] = notes.map(note => ({
    id: note.id,
    title: (note as any).title || "Untitled",
    content: note.content,
    day: (note as any).day || "Day 1",
    stop: (note as any).stop,
    createdAt: note.createdAt,
  }));

  const [filter, setFilter] = useState<"all" | "day" | "stop">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [newEntry, setNewEntry] = useState({ title: "", content: "", day: "Day 1", stop: "" });

  const deleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteNote(id);
    }
  };

  const saveEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    const noteData = {
      tripId: tripId!,
      title: newEntry.title,
      content: newEntry.content,
      day: newEntry.day,
      stop: newEntry.stop || undefined,
    };

    if (editingEntry) {
      await updateNote(editingEntry.id, noteData);
      setEditingEntry(null);
    } else {
      await addNote(noteData);
    }
    setNewEntry({ title: "", content: "", day: "Day 1", stop: "" });
    setShowAddModal(false);
  };

  const filteredEntries = filter === "all" ? entries : 
    filter === "day" ? entries.sort((a, b) => a.day.localeCompare(b.day)) :
    entries.sort((a, b) => (a.stop || "").localeCompare(b.stop || ""));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="bg-[#2E4057] text-white px-6 py-3">
        <span className="text-xl font-semibold text-[#FF6B35]">Traveloop</span>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-black mb-4">Trip Notes</h1>

        <div className="flex justify-between items-center bg-white rounded-xl border border-gray-300 p-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Trip:</span>
            <span className="text-sm font-semibold text-[#2E4057]">{cityName}</span>
          </div>
          <button
            onClick={() => { setEditingEntry(null); setShowAddModal(true); }}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] text-sm font-medium"
          >
            + Add Notes
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${filter === "all" ? "bg-[#2E4057] text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("day")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${filter === "day" ? "bg-[#2E4057] text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            By Day
          </button>
          <button
            onClick={() => setFilter("stop")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${filter === "stop" ? "bg-[#2E4057] text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            By Stop
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-3xl border border-gray-300 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-[#2E4057] text-lg">{entry.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingEntry(entry); setNewEntry({ title: entry.title, content: entry.content, day: entry.day, stop: entry.stop || "" }); setShowAddModal(true); }}
                    className="text-gray-400 hover:text-[#FF6B35] text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">{entry.content}</p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{entry.day}</span>
                {entry.stop && <span>• {entry.stop}</span>}
                <span>• {new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No journal entries yet. Add your first note!
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-[#2E4057] mb-4">
                {editingEntry ? "Edit Note" : "Add New Note"}
              </h3>
              <input
                type="text"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
              <textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Write your note..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
              <div className="flex gap-2 mb-4">
                <select
                  value={newEntry.day}
                  onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Day 1">Day 1</option>
                  <option value="Day 2">Day 2</option>
                  <option value="Day 3">Day 3</option>
                </select>
                <input
                  type="text"
                  value={newEntry.stop}
                  onChange={(e) => setNewEntry({ ...newEntry, stop: e.target.value })}
                  placeholder="Stop/Place"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddModal(false); setEditingEntry(null); setNewEntry({ title: "", content: "", day: "Day 1", stop: "" }); }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEntry}
                  className="flex-1 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
                >
                  {editingEntry ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}