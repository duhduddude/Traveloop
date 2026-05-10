import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from "firebase/firestore";

export type SectionCategory = "travel" | "hotel" | "activities" | "transport" | "custom";

export interface Section {
  id: string;
  tripId: string;
  category: SectionCategory;
  customCategoryName?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  order: number;
  createdAt: string;
}

export function useSections(tripId: string | null) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setSections([]);
      setLoading(false);
      return;
    }

    const fetchSections = async () => {
      try {
        console.log("useSections - Fetching sections for tripId:", tripId);
        const q = query(
          collection(db, `trips/${tripId}/sections`),
          orderBy("order", "asc")
        );
        console.log("useSections - Query:", q);
        const snapshot = await getDocs(q);
        console.log("useSections - Snapshot size:", snapshot.size);
        const sectionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
        console.log("useSections - Sections data:", sectionsData);
        setSections(sectionsData);
      } catch (error) {
        console.error("useSections - Error fetching sections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [tripId]);

  const addSection = async (section: Omit<Section, "id" | "createdAt" | "order">) => {
    console.log("useSections - Adding section:", section);
    console.log("useSections - Using tripId:", section.tripId);
    const newOrder = sections.length;
    
    const sectionData: Record<string, unknown> = {
      tripId: section.tripId,
      category: section.category,
      title: section.title,
      description: section.description || "",
      startDate: section.startDate || "",
      endDate: section.endDate || "",
      budget: section.budget || 0,
      order: newOrder,
      createdAt: new Date().toISOString(),
    };
    
    if (section.category === "custom" && section.customCategoryName) {
      sectionData.customCategoryName = section.customCategoryName;
    }
    
    const docRef = await addDoc(collection(db, `trips/${section.tripId}/sections`), sectionData);
    console.log("useSections - Section added with ID:", docRef.id);
    return docRef.id;
  };

  const updateSection = async (id: string, data: Partial<Section>) => {
    await updateDoc(doc(db, `trips/${tripId}/sections`, id), data);
  };

  const deleteSection = async (id: string) => {
    await deleteDoc(doc(db, `trips/${tripId}/sections`, id));
  };

  const totalBudget = sections.reduce((sum, s) => sum + (s.budget || 0), 0);

  return { sections, loading, addSection, updateSection, deleteSection, totalBudget };
}