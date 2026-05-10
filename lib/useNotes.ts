import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from "firebase/firestore";

export interface Note {
  id: string;
  tripId: string;
  stopId?: string;
  title: string;
  content: string;
  day?: string;
  stop?: string;
  createdAt: string;
}

export function useNotes(tripId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      const q = query(collection(db, `trips/${tripId}/notes`), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesData);
      setLoading(false);
    };

    fetchNotes();
  }, [tripId]);

  const addNote = async (note: Omit<Note, "id" | "createdAt">) => {
    const docRef = await addDoc(collection(db, `trips/${tripId}/notes`), {
      ...note,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    await updateDoc(doc(db, `trips/${tripId}/notes`, id), data);
  };

  const deleteNote = async (id: string) => {
    await deleteDoc(doc(db, `trips/${tripId}/notes`, id));
  };

  return { notes, loading, addNote, updateNote, deleteNote };
}