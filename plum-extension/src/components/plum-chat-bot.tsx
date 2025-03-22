import { useState, useEffect } from "react";
import {
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

import logo from "~/assets/icon.png";
import { Trash2Icon } from "lucide-react";
import { localExtStorage } from "@webext-core/storage";
import { TypingEffect } from "./typing-effect";
import { getRandomElement } from "@/lib/utils";
import { sendMessage } from "webext-bridge/popup";

interface ResponseData {
 success: boolean;
 content?: any;
 error?: string;
}

type Message = {
 role: "user" | "assistant" | "error";
 content: string;
};

const initialValue: Message[] = [
 {
  role: "assistant",
  content: "Hello! How can I help you today?",
 },
];

const placeholderOptions: string[] = [
 "Ask me anything...",
 "Chat with Plum",
 "Summarize this page",
 "What's on this page?",
 "Give me the key points",
 "Break it down for me",
 "Quick summary, please!",
 "Extract the important details",
 "Highlight the key takeaways",
 "Explain this in simple terms",
 "Make this easier to understand",
 "Find the main ideas",
 "Turn this into a short summary",
 "What's the gist of this?",
 "Help me understand this page",
];

export default function PlumChatBot() {
 const [chatMessages, setChatMessages] = useState<Message[]>(initialValue);
 const [input, setInput] = useState<string>("");
 const [loading, setLoading] = useState<boolean>(false);
 const [typingMessage, setTypingMessage] = useState<string>("");
 const [isTyping, setIsTyping] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);

 // Load messages from storage once on component mount
 useEffect(() => {
  const loadMessages = async () => {
   try {
    const localChatMessages = await localExtStorage.getItem("chat_messages");
    if (localChatMessages) {
     setChatMessages(localChatMessages);
    }
   } catch (err) {
    console.error("Failed to load chat messages:", err);
   }
  };

  loadMessages();
 }, []);

 // Save messages to storage whenever they change
 useEffect(() => {
  const saveMessages = async () => {
   try {
    await localExtStorage.setItem("chat_messages", chatMessages);
   } catch (err) {
    console.error("Failed to save chat messages:", err);
   }
  };

  saveMessages();
 }, [chatMessages]);

 const handleSendMessage = (message: string) => {
  if (!message.trim()) {
   return;
  }

  setLoading(true);
  setError(null);
  setInput("");

  const newMessages: Message[] = [
   ...chatMessages,
   { role: "user", content: message },
  ];
  setChatMessages(newMessages);

  sendToBackground(newMessages);
 };

 const sendToBackground = async (messages: Message[]) => {
  try {
   const response = await sendMessage("USER_MESSAGE", messages, "background");

   const data = response as unknown as ResponseData;

   if (data && data.success && data.content) {
    setTypingMessage(data.content);
    setIsTyping(true);
   } else if (data && !data.success && data.error) {
    setChatMessages((prev) => [
     ...prev,
     { role: "error", content: `Error: ${data.error}` },
    ]);
    setLoading(false);
   } else {
    throw new Error("Invalid response format");
   }
  } catch (err) {
   console.error("Failed to send message:", err);
   setError("Failed to get a response. Please try again.");
   setChatMessages((prev) => [
    ...prev,
    { role: "error", content: "Failed to get a response. Please try again." },
   ]);
   setLoading(false);
  }
 };

 const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  handleSendMessage(input);
 };

 const handleTypingComplete = () => {
  setChatMessages((prev) => [
   ...prev,
   { role: "assistant", content: typingMessage },
  ]);
  setTypingMessage("");
  setLoading(false);
  setIsTyping(false);
 };

 const handleClearMessages = async () => {
  setChatMessages(initialValue);
  setError(null);
  setTypingMessage("");
  setIsTyping(false);
  setLoading(false);

  try {
   await localExtStorage.setItem("chat_messages", initialValue);
  } catch (err) {
   console.error("Failed to reset chat messages in storage:", err);
  }
 };

 return (
  <main className="p-2 flex flex-col justify-center">
   <Card className="border-gray-300 rounded-xl shadow-md py-2 min-h-[96vh] gap-2">
    <CardHeader className="flex flex-row justify-between items-center h-8 px-2 border-b border-gray-300 pb-2">
     <CardTitle className="flex flex-row items-center space-x-1 select-none pointer-events-none">
      <img src={logo} alt="Extension logo" className="h-6" />
      <h1 className="font-semibold text-lg">Chat</h1>
     </CardTitle>

     <div className="flex flex-row items-center space-x-1">
      <Button
       size="icon"
       type="button"
       variant="ghost"
       onClick={handleClearMessages}
       className="h-8 w-8 p-1.5 cursor-pointer hover:bg-gray-200 hover:text-red-500 group">
       <Trash2Icon className="transition-transform duration-200 ease-in-out group-active:scale-95" />
      </Button>
     </div>
    </CardHeader>

    <CardContent className="grow overflow-y-auto max-h-[calc(100vh-8rem)] px-2">
     {chatMessages.map(({ role, content }, index) => (
      <div
       key={index}
       className={`mb-4 ${role === "user" ? "text-right" : "text-left"}`}>
       <span
        className={`inline-block p-2 rounded-lg ${
         role === "user"
          ? "bg-blue-500 text-white"
          : role === "error"
          ? "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-200"
          : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
        }`}>
        {content}
       </span>
      </div>
     ))}
     {loading && !isTyping && (
      <div className="text-left mb-4">
       <span className="inline-block p-2 rounded-lg text-gray-400 dark:text-white">
        Thinking
        <div className="flex items-center justify-center space-x-2">
         <span
          className="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}></span>
         <span
          className="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}></span>
         <span
          className="w-0.5 h-0.5 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}></span>
        </div>
       </span>
      </div>
     )}
     {isTyping && (
      <div className="text-left mb-4">
       <span className="inline-block p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
        <TypingEffect text={typingMessage} onComplete={handleTypingComplete} />
        <span className="animate-pulse ml-1">|</span>
       </span>
      </div>
     )}
    </CardContent>

    <CardFooter className="flex flex-col h-24 px-2 border-t border-gray-300 pt-3">
     <form
      onSubmit={handleFormSubmit}
      className="flex flex-col w-full space-x-2">
      <Textarea
       autoComplete="off"
       maxLength={500}
       showCount={true}
       className="resize-none focus-visible:ring-gray-500"
       placeholder={getRandomElement(placeholderOptions)}
       value={input}
       onChange={(e) => setInput(e.target.value)}
       disabled={loading}
       onSend={handleSendMessage}
      />
     </form>
    </CardFooter>
   </Card>
  </main>
 );
}
