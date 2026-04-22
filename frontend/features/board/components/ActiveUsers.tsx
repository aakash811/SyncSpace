"use client";

import { usePresenceStore } from "../store/presence.store";

export default function ActiveUsers() {
    const users = usePresenceStore((state) => state.users);
    const getInitials = (name: string) => {
        return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    };
    console.log("Active users:", users);
    return (
        <div className="absolute top-4 right-4 flex items-center gap-2">

            {/* Avatar Stack */}
            <div className="flex -space-x-2">
                {users.slice(0, 5).map((user, i) => (
                    <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center text-xs font-semibold border border-white"
                    >
                        {user.name ? getInitials(user.name) : user.userId.slice(0, 2)}
                    </div>
                ))}
            </div>

            {/* Count */}
            {users.length > 5 && (
                <div className="text-xs text-on-surface-variant"> 
                    +{users.length - 5} more
                </div>
            )}
        </div>
    )
}