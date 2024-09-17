import React, { useState, useEffect, useRef } from "react";
import { whatsappEmitter, sendMessage } from "../lib/whatsappClient";

interface Message {
  key: {
    remoteJid: string;
  };
  message: {
    conversation: string;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const newMessageHandler = useRef<((message: unknown) => void) | null>(null);

  useEffect(() => {
    newMessageHandler.current = (message: unknown) => {
      setMessages((prevMessages) => [...prevMessages, message as Message]);
    };

    whatsappEmitter.on("newMessage", newMessageHandler.current);

    return () => {
      if (newMessageHandler.current) {
        whatsappEmitter.off("newMessage", newMessageHandler.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage && recipient) {
      try {
        await sendMessage(recipient, inputMessage);
        setInputMessage("");
      } catch (error) {
        console.error("Gagal mengirim pesan:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            <strong>{message.key.remoteJid}:</strong>{" "}
            {message.message.conversation}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Nomor penerima"
          className="w-full mb-2 p-2 border rounded"
        />
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-500 text-white p-2 rounded-r"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
