"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface User {
    _id: string; // Current User ID
    name: string;
    studentId: string;
}

interface Friend {
    _id: string;
    name: string;
    username: string;
    studentId: string;
    avatarUrl?: string;
    role?: string;
    statusText?: string;
    isOnline?: boolean;
    unreadCount?: number; // Added unread count
}

interface Reaction {
    emoji: string;
    userId: string;
}

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    reactions?: Reaction[];
}

function ChatContent() {
    const searchParams = useSearchParams();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    // Fetch Current User
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/user/me");
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.user || data);
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        }
        fetchUser();
    }, []);

    // Fetch Friends (with polling for online status)
    useEffect(() => {
        if (!currentUser) return;
        let isMounted = true;

        async function fetchFriends() {
            try {
                const res = await fetch("/api/chat/friends");
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        const loadedFriends = data.friends || [];
                        setFriends(loadedFriends);
                        setLoadingFriends(false);

                        // Auto-select friend from URL if provided (only once on load)
                        const friendIdParam = searchParams.get("friendId");
                        if (friendIdParam && !selectedFriend) {
                            const friendToSelect = loadedFriends.find((f: Friend) => f._id === friendIdParam);
                            if (friendToSelect) {
                                setSelectedFriend(friendToSelect);
                                // Clear unread count locally for this user
                                setFriends(prev => prev.map(f => f._id === friendToSelect._id ? { ...f, unreadCount: 0 } : f));
                                // Remove param from URL without refreshing to avoid re-selection issues? 
                                // Actually keeping it is fine, or replaceUrl. 
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load friends", err);
            }
        }

        fetchFriends();
        const interval = setInterval(fetchFriends, 15000); // Polling every 15s

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [currentUser, searchParams]);

    // Handle friend selection
    const handleSelectFriend = (friend: Friend) => {
        setSelectedFriend(friend);
        // Optimistically clear unread count
        setFriends(prev => prev.map(f => f._id === friend._id ? { ...f, unreadCount: 0 } : f));
    };

    if (!currentUser) {
        return (
            <div className="h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col min-h-0">
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-black dark:border-slate-700 overflow-hidden flex min-h-0">

                    {/* Sidebar */}
                    <div
                        className={`w-full md:w-80 flex flex-col border-r-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 
              ${selectedFriend ? 'hidden md:flex' : 'flex'} 
            `}
                    >
                        <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
                            <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                                {friends.length} Friends
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {loadingFriends ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : friends.length === 0 ? (
                                <div className="text-center py-10 px-4 text-slate-500 dark:text-slate-400 text-sm">
                                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">No friends yet</p>
                                </div>
                            ) : (
                                friends.map((friend) => (
                                    <button
                                        key={friend._id}
                                        type="button"
                                        onClick={() => handleSelectFriend(friend)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer border relative
                      ${selectedFriend?._id === friend._id
                                                ? 'bg-indigo-50 dark:bg-indigo-900/40 shadow-sm border-indigo-200 dark:border-indigo-800'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                            }
                    `}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {friend.avatarUrl ? (
                                                <img src={friend.avatarUrl} alt={friend.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-600 bg-slate-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg border border-indigo-200 dark:border-indigo-800">
                                                    {friend.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            {/* Online Status */}
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 
                        ${friend.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}
                                            ></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <h3 className={`font-semibold truncate text-base ${selectedFriend?._id === friend._id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
                                                    {friend.name}
                                                </h3>
                                                {/* Unread Badge */}
                                                {friend.unreadCount && friend.unreadCount > 0 ? (
                                                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ml-2">
                                                        {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                @{friend.username || friend.studentId}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className={`flex-1 bg-white dark:bg-slate-900 flex flex-col relative ${!selectedFriend ? 'hidden md:flex' : 'flex'}`}>
                        {selectedFriend ? (
                            <ChatPanel
                                friend={selectedFriend}
                                currentUserId={currentUser._id}
                                onBack={() => setSelectedFriend(null)}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30 dark:bg-slate-900/50">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your Messages</h3>
                                <p className="max-w-sm text-slate-500 dark:text-slate-400">Select a friend to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-slate-100 dark:bg-slate-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}

function ChatPanel({ friend, currentUserId, onBack }: { friend: Friend, currentUserId: string, onBack: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const profileLink = `/u/${friend.username || friend.studentId}`;

    // Poll for messages
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

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

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const tempContent = inputText;
        setInputText("");
        setShowEmojiPicker(false);
        setIsSending(true);

        try {
            const res = await fetch(`/api/chat/${friend._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: tempContent }),
            });

            if (res.ok) {
                const resData = await res.json();
                setMessages((prev) => [...prev, resData.message]);
            }
        } catch (err) {
            console.error("Failed to send", err);
            setInputText(tempContent);
        } finally {
            setIsSending(false);
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputText((prev) => prev + emojiData.emoji);
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg._id === messageId) {
                const existingIdx = msg.reactions?.findIndex(r => r.userId === currentUserId && r.emoji === emoji);
                let newReactions = msg.reactions ? [...msg.reactions] : [];
                if (existingIdx !== undefined && existingIdx > -1) {
                    newReactions.splice(existingIdx, 1);
                } else {
                    newReactions.push({ emoji, userId: currentUserId });
                }
                return { ...msg, reactions: newReactions };
            }
            return msg;
        }));

        try {
            await fetch("/api/chat/reaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, emoji }),
            });
        } catch (err) {
            console.error("Failed to react", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-slate-200 dark:border-slate-700 flex items-center gap-4 bg-white dark:bg-slate-800 z-10">
                <button
                    onClick={onBack}
                    type="button"
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <Link href={profileLink} className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                    <div className="relative">
                        {friend.avatarUrl ? (
                            <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-200 dark:border-slate-600" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm border border-indigo-600">
                                {friend.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 
                ${friend.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}
                        ></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {friend.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">@{friend.username || friend.studentId}</p>
                    </div>
                </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-slate-900 scroll-smooth" ref={scrollRef}>
                {/* Encryption Notice */}
                {!loading && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-amber-200 dark:border-amber-800/50">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="font-medium">Messages are end-to-end encrypted. No one outside of this chat, not even College Connect, can read or listen to them.</span>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center items-center h-full opacity-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm opacity-60">
                        <p>No messages yet.</p>
                        <p>Start the conversation! 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg._id} className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                <div className={`relative max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm break-words
                        ${isMe
                                        ? "bg-indigo-600 text-white rounded-br-sm"
                                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700"
                                    }
                     `}>
                                    {msg.content}

                                    {/* Reaction Display Bubbles */}
                                    {msg.reactions && msg.reactions.length > 0 && (
                                        <div className={`absolute -bottom-4 ${isMe ? 'right-0' : 'left-0'} flex gap-1`}>
                                            {Array.from(new Set(msg.reactions.map(r => r.emoji))).slice(0, 3).map((emoji, idx) => (
                                                <span key={idx} className="bg-white dark:bg-slate-700 text-[10px] px-1 rounded-full shadow border border-slate-100 dark:border-slate-600">
                                                    {emoji} {msg.reactions?.filter(r => r.emoji === emoji).length}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reaction Hover Menu */}
                                    <div className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-slate-800 rounded-full shadow border border-slate-200 dark:border-slate-600 flex flex-col gap-1 items-center z-10`}>
                                        {["❤️", "👍", "😂"].map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent bubbling
                                                    handleReaction(msg._id, emoji);
                                                }}
                                                className="hover:scale-125 transition-transform text-xs cursor-pointer p-1"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 relative">
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl border border-slate-200">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme={undefined} />
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 relative">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 pl-12 pr-14 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all dark:text-white dark:placeholder-slate-400"
                        disabled={isSending}
                    />

                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
