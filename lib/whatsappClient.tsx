"use client";

import { EventEmitter } from "events";

export const whatsappEmitter = new EventEmitter();

export async function initializeWhatsAppClient() {
  try {
    const response = await fetch("/api/whatsapp/connect", { method: "POST" });
    const result = await response.json();
    console.log("Hasil koneksi:", result);
    if (result.qr) {
      whatsappEmitter.emit("qrCode", result.qr);
      console.log("QR Code:", result.qr);
    }
    if (result.status) {
      whatsappEmitter.emit("connectionStatus", result.status);
      console.log("Status koneksi:", result.status);
    }
  } catch (error) {
    console.error("Gagal menginisialisasi WhatsApp:", error);
    whatsappEmitter.emit("error", "Gagal menginisialisasi WhatsApp");
  }

  whatsappEmitter.on("connectionStatus", (status) => {
    console.log("Status koneksi WhatsApp:", status);
  });

  // Tambahkan listener untuk pesan baru
  const eventSource = new EventSource("/api/whatsapp/events");
  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    whatsappEmitter.emit("newMessage", message);
  };
}

export function disconnectWhatsAppClient() {
  console.log("Memutuskan koneksi WhatsApp");
  fetch("/api/whatsapp/disconnect", { method: "POST" });
  whatsappEmitter.removeAllListeners();
}

export async function sendMessage(to: string, message: string) {
  const response = await fetch("/api/whatsapp/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, message }),
  });
  if (!response.ok) {
    throw new Error("Gagal mengirim pesan WhatsApp");
  }
}
