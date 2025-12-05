"use client";

import { useState, useEffect, useRef } from "react";

interface User {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
}

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
}

interface ChatWindowProps {
    friend: User;
    currentUserIds: string[]; // List of IDs that represent 'me' (to handle potential inconsistencies, usually just one)
    currentUserId: string;
    onClose: () => void;
}

export default function ChatWindow({ friend, currentUserId, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);

    // Poll for messages every 3 seconds
    useEffect(() => {
        let isMounted = true;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/${friend._id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setMessages(data.messages);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [friend._id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const tempContent = inputText;
        setInputText("");
        setIsSending(true);

        try {
            const res = await fetch(`/api/chat/${friend._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: tempContent }),
            });

            if (res.ok) {
                // Optimistically add message or rely on next poll (polling is fast enough mostly, but let's fetch immediately)
                const resData = await res.json();
                setMessages((prev) => [...prev, resData.message]);
            }
        } catch (err) {
            console.error("Failed to send", err);
            setInputText(tempContent); // Restore on error
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-0 right-4 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-t-xl z-50 flex flex-col h-[500px] max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt={friend.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                {friend.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                            {friend.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Online</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50" ref={scrollRef}>
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                        <p>No messages yet.</p>
                        <p>Say hi to {friend.name.split(" ")[0]}! 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm break-words ${isMe
                                            ? "bg-indigo-600 text-white rounded-br-none"
                                            : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-600"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer / Input */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 border-0 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
