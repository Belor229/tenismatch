"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, MessageSquare, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Annonces", href: "/ads", icon: Search },
    { name: "Calendrier", href: "/calendar", icon: Calendar },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Profil", href: "/profile", icon: User },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:flex fixed top-0 w-full h-16 bg-white border-b border-gray-200 z-50 px-8 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-brand-yellow rounded-full shadow-sm" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-brand-green italic">TennisMatch</span>
                </div>
                <div className="flex items-center gap-6">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-brand-green",
                                    isActive ? "text-brand-green" : "text-gray-600"
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                    <Link
                        href="/ads/create"
                        className="bg-brand-green text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md shadow-brand-green/20"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Publier
                    </Link>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 min-w-[64px]",
                                    isActive ? "text-brand-green font-semibold" : "text-gray-500"
                                )}
                            >
                                <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
                                <span className="text-[10px]">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Top Header */}
            <div className="md:hidden fixed top-0 w-full h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-5">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-brand-yellow rounded-full shadow-xs" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-brand-green italic">TennisMatch</span>
                </div>
                <Link href="/ads/create" className="text-brand-green">
                    <PlusCircle className="w-6 h-6" />
                </Link>
            </div>
        </>
    );
}
