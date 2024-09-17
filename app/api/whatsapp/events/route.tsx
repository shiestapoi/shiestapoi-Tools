export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { whatsappEmitter } from "@/lib/whatsapp";

export async function GET() {
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

      const messageHandler = (message: unknown) => {
        sendEvent("message", message);
      };

      const connectionStatusHandler = (status: string) => {
        sendEvent("connectionStatus", { status });
      };

      const qrCodeHandler = (qrCode: string) => {
        sendEvent("qrCode", { qrCode });
      };

      const numberPhoneConnectionHandler = (numberPhoneConnection: string) => {
        sendEvent("numberPhoneConnection", { numberPhoneConnection });
      };

      const versionHandler = (version: string) => {
        sendEvent("version", { version });
      };

      whatsappEmitter.on("newMessage", messageHandler);
      whatsappEmitter.on("connectionStatus", connectionStatusHandler);
      whatsappEmitter.on("qrCode", qrCodeHandler);
      whatsappEmitter.on("numberPhoneConnection", numberPhoneConnectionHandler);
      whatsappEmitter.on("version", versionHandler);
      // Cleanup function
      return () => {
        whatsappEmitter.off("newMessage", messageHandler);
        whatsappEmitter.off("connectionStatus", connectionStatusHandler);
        whatsappEmitter.off("qrCode", qrCodeHandler);
        whatsappEmitter.off(
          "numberPhoneConnection",
          numberPhoneConnectionHandler
        );
        whatsappEmitter.off("version", versionHandler);
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
}
