"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useSections, SectionCategory } from "@/lib/useSections";

const categoryConfig = {
  travel: { icon: "✈️", color: "bg-blue-100 text-blue-700", label: "Travel" },
  hotel: { icon: "🏨", color: "bg-purple-100 text-purple-700", label: "Hotel" },
  activities: { icon: "🎯", color: "bg-orange-100 text-orange-700", label: "Activities" },
  transport: { icon: "🚗", color: "bg-green-100 text-green-700", label: "Transport" },
  custom: { icon: "📝", color: "bg-gray-100 text-gray-700", label: "Custom" },
};

interface TripData {
  id: string;
  userId: string;
  name: string;
  destination?: string;
  startDate: string;
  endDate: string;
  description: string;
  coverPhoto?: string;
  isPublic: boolean;
  createdAt: string;
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { sections, loading: sectionsLoading, addSection, updateSection, deleteSection, totalBudget } = useSections(trip?.id || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "travel" as SectionCategory,
    customCategoryName: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: 0,
  });

  useEffect(() => {
    const fetchTrip = async () => {
      if (!user) return;
      
      try {
        const tripDoc = await getDoc(doc(db, "trips", resolvedParams.id));
        if (tripDoc.exists()) {
          const data = tripDoc.data() as Omit<TripData, "id">;
          if (data.userId !== user.uid) {
            router.push("/");
            return;
          }
          setTrip({ id: tripDoc.id, ...data });
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [user, resolvedParams.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-20">
      <div className="bg-[#2E4057] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-[#FF6B35]">Traveloop</Link>
          <span className="text-gray-400">/</span>
          <Link href="/" className="text-sm hover:text-gray-300">My Trips</Link>
        </div>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <Link href="/profile">
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-[#FF6B35]" />
            </Link>
          ) : (
            <Link href="/profile" className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-medium text-sm">
              {user?.email?.[0].toUpperCase() || "?"}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-[#FF6B35] hover:underline">← Back to My Trips</Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          {trip.coverPhoto ? (
            <div 
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${trip.coverPhoto})` }}
            />
          ) : (
            <div className="h-64 bg-gradient-to-br from-[#2E4057] to-[#1D976C] flex items-center justify-center">
              <span className="text-6xl">✈️</span>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{trip.name}</h1>
                {trip.destination && (
                  <p className="text-lg text-gray-500 flex items-center gap-2">
                    📍 {trip.destination}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#e55a2b]">
                  Edit Trip
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <span>
                  {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <span>{duration} days</span>
              </div>
            </div>

            {trip.description && (
              <p className="text-gray-600">{trip.description}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {["overview", "itinerarySections", "activities", "packing", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "itinerarySections" ? "Itinerary Sections" : tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Trip Overview</h3>
                <p className="text-gray-500 mb-6">Start planning your adventure!</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setActiveTab("itinerarySections")}
                    className="px-6 py-3 bg-[#2E4057] text-white rounded-xl font-medium hover:bg-[#1D976C]"
                  >
                    Add Stops
                  </button>
                  <button 
                    onClick={() => setActiveTab("activities")}
                    className="px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#e55a2b]"
                  >
                    Find Activities
                  </button>
                </div>
              </div>
            )}

            {activeTab === "itinerarySections" && (
              <div>
                {sectionsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : (
                  <>
                    {sections.length > 0 && (
                      <div className="bg-gradient-to-r from-[#2E4057] to-[#1D976C] rounded-xl p-4 mb-6 text-white">
                        <div className="text-sm opacity-80">Total Budget</div>
                        <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
                      </div>
                    )}

                    <div className="space-y-4 mb-6">
                      {sections.map((section) => (
                        <div key={section.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${categoryConfig[section.category].color}`}>
                              <span className="mr-1">{categoryConfig[section.category].icon}</span>
                              {section.category === "custom" ? section.customCategoryName : categoryConfig[section.category].label}
                            </div>
                            <button
                              onClick={() => deleteSection(section.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              🗑️
                            </button>
                          </div>

                          {editingSection === section.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Section title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                              <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="date"
                                  value={formData.startDate}
                                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                  min={trip.startDate}
                                  max={trip.endDate}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                  type="date"
                                  value={formData.endDate}
                                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                  min={trip.startDate}
                                  max={trip.endDate}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <input
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                                placeholder="Budget ($)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    await updateSection(section.id, {
                                      title: formData.title,
                                      description: formData.description,
                                      startDate: formData.startDate,
                                      endDate: formData.endDate,
                                      budget: formData.budget,
                                    });
                                    setEditingSection(null);
                                  }}
                                  className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingSection(null)}
                                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">{section.title || "Untitled Section"}</h4>
                              {section.description && (
                                <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                {section.startDate && (
                                  <span>📅 {new Date(section.startDate).toLocaleDateString()}</span>
                                )}
                                {section.endDate && (
                                  <span>→ {new Date(section.endDate).toLocaleDateString()}</span>
                                )}
                                {section.budget > 0 && (
                                  <span className="text-[#FF6B35] font-medium">${section.budget.toLocaleString()}</span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setEditingSection(section.id);
                                  setFormData({
                                    category: section.category,
                                    customCategoryName: section.customCategoryName || "",
                                    title: section.title,
                                    description: section.description,
                                    startDate: section.startDate,
                                    endDate: section.endDate,
                                    budget: section.budget,
                                  });
                                }}
                                className="mt-3 text-sm text-[#FF6B35] hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {showAddForm ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Add New Section</h3>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {(Object.keys(categoryConfig) as SectionCategory[]).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setFormData({ ...formData, category: cat })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  formData.category === cat
                                    ? "bg-[#FF6B35] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                <span className="mr-1">{categoryConfig[cat].icon}</span>
                                {categoryConfig[cat].label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {formData.category === "custom" && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Category Name</label>
                            <input
                              type="text"
                              value={formData.customCategoryName}
                              onChange={(e) => setFormData({ ...formData, customCategoryName: e.target.value })}
                              placeholder="e.g., Shopping, Medical, etc."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Flight to Paris, Hilton Hotel, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Additional details..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              min={trip.startDate}
                              max={trip.endDate}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                              type="date"
                              value={formData.endDate}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              min={trip.startDate}
                              max={trip.endDate}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
                          <input
                            type="number"
                            value={formData.budget || ""}
                            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={async () => {
                              if (!formData.title) return;
                              await addSection({
                                tripId: trip.id,
                                category: formData.category,
                                customCategoryName: formData.category === "custom" ? formData.customCategoryName : undefined,
                                title: formData.title,
                                description: formData.description,
                                startDate: formData.startDate,
                                endDate: formData.endDate,
                                budget: formData.budget,
                              });
                              setFormData({
                                category: "travel",
                                customCategoryName: "",
                                title: "",
                                description: "",
                                startDate: "",
                                endDate: "",
                                budget: 0,
                              });
                              setShowAddForm(false);
                            }}
                            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-medium"
                          >
                            Add Section
                          </button>
                          <button
                            onClick={() => {
                              setShowAddForm(false);
                              setFormData({
                                category: "travel",
                                customCategoryName: "",
                                title: "",
                                description: "",
                                startDate: "",
                                endDate: "",
                                budget: 0,
                              });
                            }}
                            className="px-6 py-2 border border-gray-300 rounded-lg font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                              setFormData({
                                category: "travel",
                                customCategoryName: "",
                                title: "",
                                description: "",
                                startDate: trip.startDate,
                                endDate: trip.endDate,
                                budget: 0,
                              });
                              setShowAddForm(true);
                            }}
                        className="w-full py-4 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#e55a2b] transition-colors"
                      >
                        + Add another Section
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "activities" && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Activities</h3>
                <p className="text-gray-500 mb-6">Find and add activities to your trip</p>
                <Link 
                  href="/activity-search"
                  className="inline-block px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#e55a2b]"
                >
                  Search Activities
                </Link>
              </div>
            )}

            {activeTab === "packing" && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎒</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Packing List</h3>
                <p className="text-gray-500 mb-6">Keep track of what to pack</p>
                <button className="px-6 py-3 bg-[#2E4057] text-white rounded-xl font-medium hover:bg-[#1D976C]">
                  Create Packing List
                </button>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Trip Notes</h3>
                <p className="text-gray-500 mb-6">Add notes and important information</p>
                <button className="px-6 py-3 bg-[#2E4057] text-white rounded-xl font-medium hover:bg-[#1D976C]">
                  Add Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Link
        href="/trips/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF6B35] text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-[#e55a2b] transition-colors z-50"
      >
        +
      </Link>
    </div>
  );
}