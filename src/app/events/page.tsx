import { Calendar, MapPin, Users, Clock, Plus, Filter, Search } from "lucide-react";
import Link from "next/link";
import { getEvents } from "./actions";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
    const userId = await getCurrentUserId();
    const events = await getEvents({ limit: 50 });

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'tournament': return "bg-purple-100 text-purple-600";
            case 'local_meetup': return "bg-blue-100 text-blue-600";
            case 'training': return "bg-green-100 text-green-600";
            case 'social': return "bg-orange-100 text-orange-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'tournament': return "Tournoi";
            case 'local_meetup': return "Rencontre locale";
            case 'training': return "Entraînement";
            case 'social': return "Événement social";
            default: return type;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
                            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isEventUpcoming = (dateString: string) => {
        return new Date(dateString) > new Date();
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Événements Tennis</h1>
                    <p className="text-gray-500">Participez à des tournois et rencontres près de chez vous.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher un événement..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                    {userId && (
                        <Link
                            href="/events/create"
                            className="bg-brand-green text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all shadow-lg"
                        >
                            <Plus className="w-5 h-5" /> Créer un événement
                        </Link>
                    )}
                </div>
            </div>

            {/* Event Categories */}
            <div className="flex flex-wrap gap-3 mb-8">
                {['tournament', 'local_meetup', 'training', 'social'].map((type) => (
                    <button
                        key={type}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            getEventTypeColor(type)
                        }`}
                    >
                        {getEventTypeLabel(type)}
                    </button>
                ))}
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-dashed border-gray-200 py-20 text-center">
                    <div className="w-20 h-20 bg-ui-gray/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement à venir</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Soyez le premier à organiser un événement et rassemblez la communauté !
                    </p>
                    {userId && (
                        <Link
                            href="/events/create"
                            className="text-brand-green font-bold flex items-center gap-2 justify-center hover:translate-x-1 transition-transform"
                        >
                            Créer mon premier événement <Calendar className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event: any) => (
                        <div key={event.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                            {/* Banner */}
                            <div className="h-48 bg-gradient-to-br from-brand-green/10 to-brand-yellow/10 relative overflow-hidden">
                                {event.banner_url ? (
                                    <img 
                                        src={event.banner_url} 
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Calendar className="w-16 h-16 text-brand-green/30" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getEventTypeColor(event.event_type)}`}>
                                        {getEventTypeLabel(event.event_type)}
                                    </span>
                                </div>
                                {!isEventUpcoming(event.start_datetime) && (
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            Terminé
                                        </span>
                                    </div>
                                )}
                                {event.is_full && isEventUpcoming(event.start_datetime) && (
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            Complet
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center">
                                        {event.avatar_url ? (
                                            <img 
                                                src={event.avatar_url} 
                                                alt={event.display_name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-brand-green font-bold text-sm uppercase">
                                                {event.display_name?.charAt(0) || "U"}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{event.display_name}</p>
                                        <p className="text-xs text-gray-500">Organisateur</p>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-green transition-colors">
                                    {event.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {event.description}
                                </p>

                                {/* Event details */}
                                <div className="space-y-2 text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(event.start_datetime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        <span>{event.location}, {event.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        <span>
                                            {event.current_participants || 0}
                                            {event.max_participants ? `/${event.max_participants}` : ''} participants
                                        </span>
                                    </div>
                                    {event.entry_fee && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-brand-green">
                                                {event.entry_fee}€
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex-1 text-center bg-brand-green text-white py-2 rounded-xl font-medium hover:bg-opacity-90 transition-colors"
                                    >
                                        Voir détails
                                    </Link>
                                    {userId && isEventUpcoming(event.start_datetime) && !event.is_full && (
                                        <Link
                                            href={`/events/${event.id}/join`}
                                            className="flex-1 text-center border border-brand-green text-brand-green py-2 rounded-xl font-medium hover:bg-brand-green hover:text-white transition-colors"
                                        >
                                            S'inscrire
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Load more */}
            {events.length > 0 && (
                <div className="text-center mt-12">
                    <button className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        Charger plus d'événements
                    </button>
                </div>
            )}
        </div>
    );
}
