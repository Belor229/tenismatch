"use client";

import { useState } from "react";
import { Trophy, Calendar, Plus, X, Check } from "lucide-react";
import { addVictoryForCurrentUser } from "./actions";
import { cn } from "@/lib/utils";

export default function VictoryManager({ initialVictories }: { initialVictories: any[] }) {
    const [victories, setVictories] = useState(initialVictories);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        eventDate: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result: any = await addVictoryForCurrentUser(formData);

        if (result.success) {
            setVictories([
                { ...formData, id: Date.now(), event_date: formData.eventDate },
                ...victories
            ]);
            setFormData({ title: "", description: "", eventDate: "" });
            setShowForm(false);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 mb-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Trophy className="w-7 h-7 text-brand-yellow" /> Vie sportive & Palmarès
                </h2>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-xl font-bold text-xs hover:bg-brand-green/20 transition-all border border-brand-green/10"
                    >
                        <Plus className="w-4 h-4" /> Ajouter
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-6 bg-brand-green/5 rounded-[32px] border border-brand-green/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-brand-green text-sm uppercase tracking-widest">Nouvelle Victoire</h4>
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Titre / Compétition</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Tournoi Cotonou Open"
                                className="w-full bg-white border border-gray-100 py-3 px-4 rounded-xl focus:ring-2 focus:ring-brand-green outline-none text-sm transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date</label>
                            <input
                                required
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                className="w-full bg-white border border-gray-100 py-3 px-4 rounded-xl focus:ring-2 focus:ring-brand-green outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Description (Optionnelle)</label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ex: Victoire en 3 sets contre le favori..."
                            className="w-full bg-white border border-gray-100 py-3 px-4 rounded-xl focus:ring-2 focus:ring-brand-green outline-none text-sm transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-brand-green/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Enregistrement..." : "Enregistrer la victoire"} <Check className="w-4 h-4" />
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expériences passées</h3>
                    <div className="bg-ui-gray/10 p-5 rounded-3xl text-sm text-gray-600 leading-relaxed border border-gray-50 italic">
                        {victories.length > 0 ? "Retrouvez ci-contre le détail de vos succès sur les courts." : "Partagez vos victoires pour inspirer la communauté."}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                        Détails du Palmarès
                        <span className="text-[10px] font-bold text-brand-green">{victories.length} victoires</span>
                    </h3>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {victories.length > 0 ? (
                            victories.map((v: any) => (
                                <div key={v.id} className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-brand-green/30 transition-all shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-800 text-sm group-hover:text-brand-green transition-colors">{v.title}</h4>
                                        {v.event_date && <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(v.event_date).toLocaleDateString()}</span>}
                                    </div>
                                    {v.description && <p className="text-[11px] text-gray-500 line-clamp-2 italic">{v.description}</p>}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-ui-gray/5 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-xs italic">Aucune victoire enregistrée.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
