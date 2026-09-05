import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "../components/AppLayout";
import { usePantry } from "../lib/pantry-store";
import { useChatStore, type ChatMessage } from "../lib/chat-store";
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import {
  Bot,
  MessageCircle,
  Send,
  Mic,
  Plus,
  Clock,
  Users,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/chef")({
  head: () => ({ meta: [{ title: "Chef Asistente — Despensa Inteligente" }] }),
  component: ChefPage,
});

const SUGGESTIONS = [
  "¿Qué hago con lo que tengo?",
  "Algo rápido, estoy cansado",
  "Tengo poco presupuesto",
  "¿Qué está por vencer?",
];

function ChefPage() {
  const { profile, pantry } = usePantry();
  const { messages, addMessage, clearMessages } = useChatStore();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const webhookUrl =
    import.meta.env.VITE_CHEF_WEBHOOK_URL || "https://jerengifo.app.n8n.cloud/webhook/Cocinawh";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, errorText]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-PE";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = async (overrideMessage?: string) => {
    const messageContent = (overrideMessage || input).trim();
    if (!messageContent || isTyping) return;

    setErrorText(null);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };

    addMessage(userMessage);
    if (!overrideMessage) setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    await sendMessageToBackend(userMessage.content);
  };

  const sendMessageToBackend = async (content: string) => {
    setIsTyping(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

    try {
      const pantryNames = pantry.map((item) => item.name);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages,
          pantry: pantryNames,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      const responseContent =
        data.responseText ||
        data.output ||
        data.text ||
        data.message ||
        data.response ||
        (typeof data === "string" ? data : JSON.stringify(data));

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: responseContent,
        recipes: Array.isArray(data.suggestedRecipes) ? data.suggestedRecipes : [],
      };

      addMessage(agentMessage);
    } catch (err: any) {
      console.error("Error from webhook:", err);
      setErrorText("Error de conexión. Ocurrió un problema al enviar tu mensaje.");
    } finally {
      clearTimeout(timeoutId);
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <AppLayout title="Chef Asistente" subtitle="Resuelve tu comida del día" fullHeight>
      <div className="flex h-full flex-col relative">
        {/* Header Extra */}
        <div className="absolute top-0 right-4 z-10 flex h-16 items-center">
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-muted-foreground"
              title="Nueva conversación"
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva
            </Button>
          )}
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-warm text-primary-foreground shadow-[var(--shadow-soft)]">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold md:text-3xl text-foreground">
                    ¿Qué cocinamos hoy{profile.name ? `, ${profile.name}` : ""}?
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Tienes {pantry.length} producto{pantry.length !== 1 ? "s" : ""} en tu despensa.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleSend(sug)}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="w-full">
                    {msg.role === "user" ? (
                      <div className="flex w-full justify-end">
                        <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-2.5 text-[15px] text-secondary-foreground leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full gap-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-warm text-primary-foreground shadow-sm">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="prose prose-sm prose-p:leading-relaxed prose-p:my-1 text-[15px] text-foreground max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>

                          {/* Recipe Cards */}
                          {msg.recipes && msg.recipes.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {msg.recipes.map((recipe) => (
                                <Link
                                  key={recipe.id}
                                  to={`/recetas/${recipe.id}`}
                                  className="group flex flex-col overflow-hidden rounded-2xl surface-card transition-shadow hover:shadow-[var(--shadow-lift)]"
                                >
                                  {recipe.image ? (
                                    <img
                                      src={recipe.image}
                                      alt={recipe.name}
                                      className="aspect-[16/10] w-full object-cover"
                                    />
                                  ) : (
                                    <div className="aspect-[16/10] w-full bg-muted flex items-center justify-center">
                                      <ChefHat className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                  )}
                                  <div className="flex flex-col p-3">
                                    <span className="font-display font-semibold line-clamp-1">
                                      {recipe.name}
                                    </span>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{recipe.minutes}m</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{recipe.servings}</span>
                                      </div>
                                      <div className="rounded border px-1.5 text-[10px] uppercase">
                                        {recipe.meal}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex w-full gap-4 items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-warm text-primary-foreground shadow-sm animate-pulse">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                )}

                {errorText && (
                  <div className="flex w-full justify-end mt-2">
                    <div className="flex max-w-[80%] flex-col gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <div className="flex items-center gap-2 font-medium">
                        <TriangleAlert className="h-4 w-4" />
                        {errorText}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-end bg-background h-8"
                        onClick={() => {
                          const lastUserMsg = messages.filter((m) => m.role === "user").pop();
                          if (lastUserMsg) sendMessageToBackend(lastUserMsg.content);
                        }}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" /> Reintentar
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur border-t border-border/50 p-4">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl surface-card p-2 focus-within:ring-2 focus-within:ring-ring transition-all">
              <Button
                variant="ghost"
                size="icon"
                onClick={startListening}
                className={`h-10 w-10 shrink-0 rounded-full transition-colors ${isListening ? "text-primary bg-primary/10 animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
                title="Dictar mensaje"
                type="button"
              >
                <Mic className="h-5 w-5" />
              </Button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Dime qué tienes o qué se te antoja..."
                className="max-h-[150px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[15px] outline-none placeholder:text-muted-foreground"
                rows={1}
              />

              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full gradient-warm text-primary-foreground shadow-[var(--shadow-lift)] disabled:opacity-50"
                type="button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {/* Safe area padding block spacing for mobile to push above nav if it overlaps. But AppLayout padding-bottom handles the nav, so this is just inner spacing */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
