"use client";

import { useState, useRef } from "react";
import { Download, Share2, Calendar, MapPin, Users, Trophy, Phone } from "lucide-react";

export default function FlyerGenerator({ event }: { event: any }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [flyerStyle, setFlyerStyle] = useState<'modern' | 'classic' | 'minimal'>('modern');

    const generateFlyer = async () => {
        setIsGenerating(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size (A4 ratio)
        canvas.width = 2480;
        canvas.height = 3508;

        // Background based on style
        if (flyerStyle === 'modern') {
            // Modern gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#059669');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add pattern overlay
            ctx.globalAlpha = 0.1;
            for (let i = 0; i < 50; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 100 + 50,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        } else if (flyerStyle === 'classic') {
            // Classic tennis court green
            ctx.fillStyle = '#2d5016';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Court lines
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 8;
            ctx.strokeRect(100, 100, canvas.width - 200, canvas.height - 200);
        } else {
            // Minimal clean white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Title section
        ctx.fillStyle = flyerStyle === 'minimal' ? '#10b981' : '#ffffff';
        ctx.font = 'bold 180px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(event.title.toUpperCase(), canvas.width / 2, 400);

        // Event type badge
        const eventTypeColors: Record<string, string> = {
            tournament: '#7c3aed',
            local_meetup: '#3b82f6',
            training: '#059669',
            social: '#f97316'
        };

        const eventTypeLabels: Record<string, string> = {
            tournament: 'TOURNOI',
            local_meetup: 'RENCONTRE',
            training: 'ENTRAÎNEMENT',
            social: 'ÉVÉNEMENT SOCIAL'
        };

        ctx.fillStyle = eventTypeColors[event.event_type] || '#10b981';
        ctx.fillRect(canvas.width / 2 - 300, 500, 600, 120);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.fillText(eventTypeLabels[event.event_type] || 'ÉVÉNEMENT', canvas.width / 2, 580);

        // Date and time
        ctx.fillStyle = flyerStyle === 'minimal' ? '#374151' : '#ffffff';
        ctx.font = 'bold 80px Arial';
        const eventDate = new Date(event.start_datetime);
        ctx.fillText(
            eventDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }),
            canvas.width / 2,
            800
        );

        ctx.font = '60px Arial';
        ctx.fillText(
            eventDate.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            canvas.width / 2,
            900
        );

        // Location
        ctx.font = '70px Arial';
        ctx.fillText(event.location, canvas.width / 2, 1100);
        ctx.font = '50px Arial';
        ctx.fillText(`${event.city}, ${event.country}`, canvas.width / 2, 1200);

        // Description
        ctx.font = '40px Arial';
        const words = event.description.split(' ');
        let line = '';
        let y = 1400;
        const maxWidth = canvas.width - 400;
        const lineHeight = 60;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, canvas.width / 2, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, canvas.width / 2, y);

        // Participants info
        if (event.max_participants) {
            ctx.fillStyle = flyerStyle === 'minimal' ? '#6b7280' : '#ffffff';
            ctx.font = '50px Arial';
            ctx.fillText(
                `Places limitées: ${event.current_participants || 0}/${event.max_participants}`,
                canvas.width / 2,
                y + 150
            );
        }

        // Entry fee
        if (event.entry_fee) {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(canvas.width / 2 - 200, y + 200, 400, 100);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 60px Arial';
            ctx.fillText(`${event.entry_fee}€`, canvas.width / 2, y + 270);
        }

        // Footer
        ctx.fillStyle = flyerStyle === 'minimal' ? '#9ca3af' : '#ffffff';
        ctx.font = '40px Arial';
        ctx.fillText('TennisMatch - La communauté tennis n°1', canvas.width / 2, canvas.height - 200);

        // Contact/QR placeholder
        ctx.fillStyle = flyerStyle === 'minimal' ? '#10b981' : '#ffffff';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height - 400, 300, 150);
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.fillText('Scannez pour vous inscrire', canvas.width / 2, canvas.height - 320);

        setIsGenerating(false);
    };

    const downloadFlyer = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `flyer-${event.title.replace(/\s+/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    const shareFlyer = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            
            if (navigator.share && blob) {
                const file = new File([blob], `flyer-${event.title}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        title: `Flyer - ${event.title}`,
                        text: `Rejoignez-nous pour ${event.title} !`,
                        files: [file]
                    });
                } catch (error) {
                    console.error('Error sharing:', error);
                }
            } else {
                // Fallback: download
                downloadFlyer();
            }
        }, 'image/png');
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Générer un flyer</h3>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Style:</label>
                    <select
                        value={flyerStyle}
                        onChange={(e) => setFlyerStyle(e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="modern">Moderne</option>
                        <option value="classic">Classique</option>
                        <option value="minimal">Minimal</option>
                    </select>
                </div>
            </div>

            {/* Canvas (hidden) */}
            <canvas
                ref={canvasRef}
                className="hidden"
                width={2480}
                height={3508}
            />

            {/* Preview */}
            <div className="mb-6">
                <div className="aspect-[2.8/4] bg-gray-100 rounded-xl overflow-hidden">
                    <img
                        src="/api/flyer-preview"
                        alt="Flyer preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,%3Csvg width='200' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='300' fill='%2310b981'/%3E%3Ctext x='100' y='150' text-anchor='middle' fill='white' font-family='Arial' font-size='20'%3EAperçu indisponible%3C/text%3E%3C/svg%3E`;
                        }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={generateFlyer}
                    disabled={isGenerating}
                    className="flex-1 bg-brand-green text-white py-3 rounded-xl font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Génération...
                        </>
                    ) : (
                        <>
                            <Trophy className="w-4 h-4" />
                            Générer le flyer
                        </>
                    )}
                </button>
                
                <button
                    onClick={downloadFlyer}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Télécharger
                </button>
                
                <button
                    onClick={shareFlyer}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                    Partager
                </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                    💡 Le flyer généré inclut toutes les informations clés de l'événement : titre, date, lieu, description et informations d'inscription.
                </p>
            </div>
        </div>
    );
}
