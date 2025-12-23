import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "../components/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquarePlus, Send } from "lucide-react";
import MessageBubble from "../components/agents/MessageBubble";

export default function Copilot() {
  const { language } = useLanguage();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const title = useMemo(() => {
    switch (language) {
      case "he":
        return "קופילוט — ניהול טיולים";
      case "ru":
        return "Копилот — управление поездками";
      case "es":
        return "Copilot — gestión de viajes";
      case "fr":
        return "Copilot — gestion des voyages";
      case "de":
        return "Copilot — Reiseverwaltung";
      case "it":
        return "Copilot — gestione viaggi";
      default:
        return "Copilot — Trip Management";
    }
  }, [language]);

  useEffect(() => {
    const init = async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: "organizer_copilot" });
        let conv = Array.isArray(list) && list.length > 0 ? list[0] : null;
        if (!conv) {
          conv = await base44.agents.createConversation({
            agent_name: "organizer_copilot",
            metadata: { name: "Organizer Copilot" },
          });
        }
        setConversation(conv);
        setMessages(conv.messages || []);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      // auto scroll to end
      setTimeout(() => {
        if (endRef.current) {
          endRef.current.scrollIntoView({ behavior: 'auto' });
        }
      }, 0);
    });
    return () => unsubscribe && unsubscribe();
  }, [conversation?.id]);

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: input.trim() });
      setInput("");
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = async () => {
    setLoading(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "organizer_copilot",
        metadata: { name: "Organizer Copilot" },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
        <Button variant="outline" className="gap-2" onClick={handleNewChat}>
          <MessageSquarePlus className="w-4 h-4" />
          {language === "he" ? "שיחה חדשה" : language === "ru" ? "Новый чат" : language === "es" ? "Nuevo chat" : language === "fr" ? "Nouveau chat" : language === "de" ? "Neuer Chat" : language === "it" ? "Nuova chat" : "New Chat"}
        </Button>
      </div>

      <Card className="border-2 border-emerald-100 shadow-sm">
        <div className="h-[60vh] flex flex-col">
          <ScrollArea className="flex-1 p-3 sm:p-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === "he" ? "טוען את השיחה..." : language === "ru" ? "Загрузка чата..." : language === "es" ? "Cargando chat..." : language === "fr" ? "Chargement du chat..." : language === "de" ? "Chat wird geladen..." : language === "it" ? "Caricamento chat..." : "Loading chat..."}
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-600">
                <div>
                  <p className="font-semibold mb-1">
                    {language === "he" ? "ברוך הבא לקופילוט!" : language === "ru" ? "Добро пожаловать в Copilot!" : language === "es" ? "¡Bienvenido a Copilot!" : language === "fr" ? "Bienvenue dans Copilot !" : language === "de" ? "Willkommen bei Copilot!" : language === "it" ? "Benvenuto in Copilot!" : "Welcome to Copilot!"}
                  </p>
                  <p className="text-sm">
                    {language === "he"
                      ? "שאל על בקשות הצטרפות, בקש ליצור/לעדכן טיול, לשלוח הודעה או לקבוע תזכורת"
                      : language === "ru"
                      ? "Спросите про заявки на вступление, попросите создать/обновить поездку, отправить сообщение или назначить напоминание"
                      : language === "es"
                      ? "Pregunta por solicitudes de unión, pide crear/actualizar un viaje, enviar un mensaje o programar un recordatorio"
                      : language === "fr"
                      ? "Demandez les demandes d'adhésion, créez/mettre à jour un voyage, envoyer un message ou programmer un rappel"
                      : language === "de"
                      ? "Fragen Sie nach Beitrittsanfragen, erstellen/aktualisieren Sie eine Reise, senden Sie eine Nachricht oder planen Sie eine Erinnerung"
                      : language === "it"
                      ? "Chiedi delle richieste di adesione, crea/aggiorna un viaggio, invia un messaggio o pianifica un promemoria"
                      : "Ask about join requests, create/update a trip, send a message or set a reminder"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((m, idx) => (
                  <MessageBubble key={idx} message={m} />
                ))}
                <div ref={endRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-3 sm:p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  language === "he"
                    ? "כתוב הודעה לקופילוט..."
                    : language === "ru"
                    ? "Напишите сообщение Copilot..."
                    : language === "es"
                    ? "Escribe un mensaje a Copilot..."
                    : language === "fr"
                    ? "Écrivez un message à Copilot..."
                    : language === "de"
                    ? "Nachricht an Copilot schreiben..."
                    : language === "it"
                    ? "Scrivi a Copilot..."
                    : "Write a message to Copilot..."
                }
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || sending} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {language === "he" ? "שלח" : language === "ru" ? "Отправить" : language === "es" ? "Enviar" : language === "fr" ? "Envoyer" : language === "de" ? "Senden" : language === "it" ? "Invia" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}