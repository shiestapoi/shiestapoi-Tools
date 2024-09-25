export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToWhatsApp, whatsappEmitter } from "@/lib/whatsapp";

let isConnected = false;
let connectionStatus = "disconnected"; // Status koneksi global

// Listener untuk memantau perubahan status koneksi
whatsappEmitter.on("connectionStatus", (status) => {
  connectionStatus = status; // Update status koneksi secara real-time
  if (status === "open") {
    isConnected = true;
  } else {
    isConnected = false;
  }
});

export async function GET() {
  try {
    // Cek status koneksi real-time tanpa connectToWhatsApp ulang
    if (!isConnected) {
      console.log("Not connected, connecting...");
      connectToWhatsApp();
    }

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        let isControllerClosed = false;

        const sendEvent = (event: string, data: unknown) => {
          if (!isControllerClosed) {
            try {
              controller.enqueue(encoder.encode(`event: ${event}\n`));
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            } catch (error) {
              console.error("Error sending event:", error);
              isControllerClosed = true;
            }
          }
        };

        // Memantau event dari whatsappEmitter dan mengirim data ke client
        const messageHandler = (message: unknown) => {
          sendEvent("message", message);
        };

        const qrCodeHandler = (qrCode: string) => {
          sendEvent("qrCode", { qrCode });
        };

        const numberPhoneConnectionHandler = (
          numberPhoneConnection: string
        ) => {
          sendEvent("numberPhoneConnection", { numberPhoneConnection });
        };

        const versionHandler = (version: string) => {
          sendEvent("version", { version });
        };

        const connectionStatusHandler = (status: string) => {
          sendEvent("connectionStatus", { status });
        };

        whatsappEmitter.on("newMessage", messageHandler);
        whatsappEmitter.on("qrCode", qrCodeHandler);
        whatsappEmitter.on("numberPhoneConnection", numberPhoneConnectionHandler);
        whatsappEmitter.on("version", versionHandler);
        whatsappEmitter.on("connectionStatus", connectionStatusHandler);
        // Cleanup saat stream ditutup
        return () => {
          whatsappEmitter.off("newMessage", messageHandler);
          whatsappEmitter.off("qrCode", qrCodeHandler);
          whatsappEmitter.off("numberPhoneConnection", numberPhoneConnectionHandler);
          whatsappEmitter.off("version", versionHandler);
          whatsappEmitter.off("connectionStatus", connectionStatusHandler);
        };
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return new NextResponse("Error fetching events", { status: 500 });
  }
}
