import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Minimize2,
  X,
  MessageCircle,
  User,
  Sparkles,
} from "lucide-react";
import aiService from "@/services/aiService";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const BotIcon = () => (
  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <Bot className="w-7 h-7 text-white" />
  </div>
);

const QUICK_ACTIONS = [
  "I have fever and headache",
  "Chest pain and breathing issues",
  "Stomach pain and nausea",
  "Back pain after exercise",
  "Skin rash and itching",
  "How do I book an appointment?",
  "How to find nursing services?",
  "Emergency - need help now",
];

const AIChat: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "👋 Hello! I'm Alex, your AI health assistant powered by advanced medical knowledge. I can help you:\n\n🩺 **Health Guidance:**\n• Find the right specialist for your symptoms\n• Get personalized doctor recommendations\n• Understand urgency levels of health concerns\n\n💻 **Platform Navigation:**\n• Book appointments and services\n• Navigate our healthcare platform\n• Answer questions about our services\n\n🔍 **Smart Assistance:**\n• Contextual health advice based on your current page\n• Emergency guidance when needed\n• Step-by-step platform tutorials\n\nWhat can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextualInfo = (): string => {
    const path = location.pathname;
    if (path.includes("/nursing")) {
      return "The user is currently on the Home Nursing Services page.";
    }
    if (path.includes("/doctor") || path.includes("/consultation")) {
      return "The user is currently on the Doctor Consultation page.";
    }
    if (path.includes("/lab")) {
      return "The user is currently on the Laboratory Services page.";
    }
    if (path.includes("/pharmacy")) {
      return "The user is currently on the Pharmacy page.";
    }
    if (path.includes("/patient-dashboard")) {
      return "The user is currently on their Patient Dashboard.";
    }
    return "The user is browsing the healthcare platform.";
  };

  const generateResponse = (userInput: string): string => {
    // Add context awareness
    const context = getContextualInfo();
    const enhancedInput = `${context} User asks: ${userInput}`;

    // Use the intelligent AI service for generating responses
    return aiService.generateResponse(enhancedInput);
  };

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || question.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    // Simulate thinking time and generate intelligent response
    setTimeout(
      () => {
        const response = generateResponse(text);
        const suggestions = aiService.getSuggestions(text);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      },
      800 + Math.random() * 800,
    ); // 0.8-1.6 seconds delay for more responsive feel
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) => (
      <div key={index} className={index > 0 ? "mt-1" : ""}>
        {line.startsWith("• ") ? (
          <div className="ml-2 text-gray-600">
            {line.split(/(\*\*.*?\*\*)/).map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={partIndex} className="text-green-700">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </div>
        ) : (
          <div>
            {line.split(/(\*\*.*?\*\*)/).map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={partIndex} className="text-green-700">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </div>
        )}
      </div>
    ));
  };

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Highlight text above the bot icon */}
          <div className="absolute -top-12 -right-2 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm whitespace-nowrap animate-pulse">
            Hi, need any help?
            {/* Speech bubble arrow */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-500"></div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="group relative"
            aria-label="Alex - AI Health Assistant"
          >
            <BotIcon />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full h-[600px] p-0 flex flex-col">
          <DialogHeader className="px-4 py-3 border-b bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white font-semibold">
                    Alex
                  </DialogTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMinimized(true)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isUser
                          ? "bg-green-500"
                          : "bg-gradient-to-br from-green-500 to-teal-600"
                      }`}
                    >
                      {message.isUser ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.isUser
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="text-sm">
                        {message.isUser
                          ? message.content
                          : formatMessage(message.content)}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.isUser ? "text-green-100" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t bg-gray-50">
            <div className="flex flex-wrap gap-1">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSendMessage(action)}
                  className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-green-50 hover:border-green-300 transition-colors"
                  disabled={loading}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Describe symptoms or ask platform questions..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1"
                disabled={loading}
                maxLength={500}
              />
              <Button
                type="submit"
                size="icon"
                className="bg-green-500 hover:bg-green-600"
                disabled={loading || !question.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIChat;
