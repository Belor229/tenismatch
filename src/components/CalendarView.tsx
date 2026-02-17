"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Trophy, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CalendarView({ initialEvents }: { initialEvents: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate);

    const getDayEvents = (day: number) => {
        return initialEvents.filter(event => {
            const d = new Date(event.event_datetime);
            return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    };

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i);

    return (
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-10 bg-brand-green text-white flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold capitalize mb-1">{monthName}</h2>
                    <p className="text-white/70 text-sm">Découvrez les événements tennis du mois.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextMonth} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="p-6 md:p-10">
                <div className="grid grid-cols-7 gap-2 mb-6">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-2">
                            {day}
                        </div>
                    ))}

                    {emptyDays.map(i => (
                        <div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-2xl" />
                    ))}

                    {days.map(day => {
                        const events = getDayEvents(day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "aspect-square p-2 border border-gray-100 rounded-3xl relative flex flex-col items-center justify-center transition-all hover:bg-gray-50 group",
                                    isToday && "border-brand-green bg-brand-green/5 shadow-inner"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-bold mb-1",
                                    isToday ? "text-brand-green" : "text-gray-900"
                                )}>
                                    {day}
                                </span>

                                <div className="flex gap-1 flex-wrap justify-center">
                                    {events.slice(0, 3).map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "w-2 h-2 rounded-full",
                                                event.type === 'match' ? 'bg-orange-500' :
                                                    event.type === 'tournoi' ? 'bg-emerald-500' : 'bg-blue-500'
                                            )}
                                        />
                                    ))}
                                </div>

                                {/* Popover on hover (Desktop) or just indicator */}
                                {events.length > 0 && (
                                    <div className="absolute top-1 right-1">
                                        <div className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
                                    </div>
                                )}

                                {/* Event list - shown on click in V2, for now just list below */}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex gap-6 pt-10 border-t border-gray-100 items-center justify-center flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" /> Partenaires
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" /> Matchs
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" /> Tournois
                    </div>
                </div>
            </div>

            {/* Events List for selected day (simplified for V1: show all month events below) */}
            <div className="px-8 pb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-brand-green" /> Événements à venir
                </h3>
                <div className="space-y-4">
                    {initialEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-10">Aucun événement prévu ce mois-ci.</p>
                    ) : (
                        initialEvents.map(event => (
                            <Link
                                key={event.id}
                                href={`/ads/${event.id}`}
                                className="flex items-center gap-5 p-5 rounded-3xl bg-ui-gray/30 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all group"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                                    event.type === 'match' ? 'bg-orange-500' :
                                        event.type === 'tournoi' ? 'bg-emerald-500' : 'bg-blue-500'
                                )}>
                                    {event.type === 'match' ? <Trophy className="w-6 h-6" /> :
                                        event.type === 'tournoi' ? <Sparkles className="w-6 h-6" /> :
                                            <MessageSquare className="w-6 h-6" />}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900 group-hover:text-brand-green transition-colors">{event.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1 font-semibold uppercase tracking-widest"><MapPin className="w-3 h-3" /> {event.city}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span>{new Date(event.event_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-brand-green transition-colors" />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

import { Calendar } from "lucide-react";
