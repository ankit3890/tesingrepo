"use client";

import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";

interface Friend {
    _id: string;
    name: string;
    username: string;
    studentId: string;
    avatarUrl?: string;
    role?: string;
    statusText?: string;
}

interface ChatCardProps {
    currentUserId: string;
}

export default function ChatCard({ currentUserId }: ChatCardProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFriend, setActiveFriend] = useState<Friend | null>(null);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch("/api/chat/friends");
                if (res.ok) {
                    const data = await res.json();
                    setFriends(data.friends || []);
                }
            } catch (err) {
                console.error("Failed to load friends", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUserId) {
            fetchFriends();
        }
    }, [currentUserId]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 h-full border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Messages
                    </h2>
                    <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                        {friends.length} Friends
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[200px] max-h-[300px]">
                    {friends.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                            <p className="mb-2">No friends yet.</p>
                            <p className="text-xs">Follow people back to chat with them!</p>
                        </div>
                    ) : (
                        friends.map((friend) => (
                            <button
                                key={friend._id}
                                onClick={() => setActiveFriend(friend)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
                            >
                                <div className="relative">
                                    {friend.avatarUrl ? (
                                        <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                            {friend.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {/* Online indicator (simulated for now, assumes mutual follows are "online" contextually or just active) */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {friend.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        @{friend.username || friend.studentId}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Actual Chat Window Popup */}
            {activeFriend && (
                <ChatWindow
                    friend={activeFriend}
                    currentUserId={currentUserId}
                    currentUserIds={[currentUserId]}
                    onClose={() => setActiveFriend(null)}
                />
            )}
        </>
    );
}
