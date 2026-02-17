import { getCalendarEvents } from "./actions";
import CalendarView from "@/components/CalendarView";

export default async function CalendarPage() {
    const now = new Date();
    const events = await getCalendarEvents(now.getMonth() + 1, now.getFullYear());

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Calendrier des Matchs</h1>
                <p className="text-gray-500">Planifiez vos prochaines sessions et ne manquez aucun tournoi.</p>
            </div>

            <CalendarView initialEvents={events} />
        </div>
    );
}
