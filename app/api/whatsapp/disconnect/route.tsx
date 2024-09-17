export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSocket } from "@/lib/whatsapp";

export async function POST() {
  const socket = getSocket();
  if (socket) {
    await socket.logout();
    return NextResponse.json({
      message: "Berhasil memutuskan koneksi WhatsApp",
    });
  } else {
    return NextResponse.json(
      { error: "Tidak ada koneksi WhatsApp aktif" },
      { status: 400 }
    );
  }
}
