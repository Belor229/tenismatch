"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

export default function LogoutButton({ variant = "default", className }: { variant?: "default" | "icon"; className?: string }) {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/");
        router.refresh();
    };

    if (variant === "icon") {
        return (
            <button
                onClick={handleLogout}
                className={cn("p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors", className)}
                title="Se déconnecter"
            >
                <LogOut className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            className={cn("p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center", className)}
            title="Se déconnecter"
        >
            <LogOut className="w-5 h-5" />
        </button>
    );
}

