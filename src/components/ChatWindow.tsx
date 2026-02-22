"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MoreVertical, ShieldAlert, PhoneOff, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import { sendMessage, getMessages } from "@/app/messages/actions";
import { supabase } from "@/lib/supabase";
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
    const [isOnline, setIsOnline] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Realtime subscription with Supabase
    useEffect(() => {
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMessage = payload.new;
                    setMessages(prev => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    // Simulate typing indicator
    useEffect(() => {
        const handleTyping = () => setIsTyping(true);
        const handleStopTyping = () => setIsTyping(false);

        // This would be implemented with WebSocket in a real app
        // For now, just a simple simulation
        const typingTimeout = setTimeout(handleStopTyping, 3000);

        return () => clearTimeout(typingTimeout);
    }, [inputText]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isSending) return;

        setIsSending(true);
        const tempMessage = {
            id: Date.now(),
            conversation_id: conversationId,
            sender_id: userId,
            message_text: inputText,
            created_at: new Date().toISOString(),
            pending: true
        };

        // Add optimistic update
        setMessages(prev => [...prev, tempMessage]);
        setInputText("");

        const result = await sendMessage(conversationId, userId, inputText);

        if (result.success) {
            // Remove pending message and let realtime handle the update
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        } else {
            // Remove pending message and show error
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            // Could show error toast here
        }
        setIsSending(false);
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const isMessageRead = (message: any) => {
        // This would be implemented with read receipts
        return message.sender_id !== userId; // Simplified for now
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
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                )} />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {isOnline ? "En ligne" : "Hors ligne"}
                                </span>
                                {isTyping && (
                                    <span className="text-[10px] text-brand-green font-medium italic">
                                        écrit...
                                    </span>
                                )}
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
                    const showReadReceipt = isMe && isMessageRead(msg);
                    
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
                                    "px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm relative",
                                    isMe
                                        ? "bg-brand-green text-white rounded-br-none" 
                                        : "bg-white text-gray-800 rounded-bl-none border border-gray-50",
                                    msg.pending && "opacity-70"
                                )}
                            >
                                {msg.message_text}
                                {msg.pending && (
                                    <div className="absolute top-1 right-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-2">
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {formatTime(msg.created_at)}
                                </span>
                                {showReadReceipt && (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                )}
                                {isMe && !showReadReceipt && !msg.pending && (
                                    <Check className="w-3 h-3 text-gray-400" />
                                )}
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs italic">{otherUserName} écrit...</span>
                    </div>
                )}
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
                        maxLength={500}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-xs text-gray-400 px-2">
                            {inputText.length}/500
                        </span>
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isSending}
                            className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-green/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all z-10"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
