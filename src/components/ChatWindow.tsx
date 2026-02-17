"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MoreVertical, ShieldAlert, PhoneOff } from "lucide-react";
import Link from "next/link";
import { sendMessage, getMessages } from "@/app/messages/actions";
import { cn } from "@/lib/utils";

export default function ChatWindow({
    conversationId,
    userId,
    initialMessages,
    otherUserName
}: {
    conversationId: number,
    userId: number,
    initialMessages: any[],
    otherUserName: string
}) {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            const newMessages = await getMessages(conversationId);
            if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                setMessages(newMessages);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [conversationId, messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isSending) return;

        setIsSending(true);
        const result = await sendMessage(conversationId, userId, inputText);

        if (result.success) {
            setInputText("");
            // Refresh messages immediately
            const updatedMessages = await getMessages(conversationId);
            setMessages(updatedMessages);
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                    <Link href="/messages" className="md:hidden text-gray-500 hover:text-brand-green">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green font-bold uppercase transition-transform hover:scale-110">
                            {otherUserName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">{otherUserName}</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">En ligne</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-brand-green transition-colors">
                        <PhoneOff className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <ShieldAlert className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-ui-gray/20">
                {messages.map((msg, i) => {
                    const isMe = msg.sender_id === userId;
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm",
                                    isMe
                                        ? "bg-brand-green text-white rounded-br-none"
                                        : "bg-white text-gray-800 rounded-bl-none border border-gray-50"
                                )}
                            >
                                {msg.message_text}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 font-medium px-2">
                                {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="w-full bg-ui-gray/50 border border-transparent py-4 pl-6 pr-16 rounded-full focus:ring-2 focus:ring-brand-green focus:bg-white focus:border-transparent outline-none transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-green/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all z-10"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
