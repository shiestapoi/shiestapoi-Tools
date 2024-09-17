export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSocket } from "@/lib/whatsapp";

function formatWhatsAppNumber(number: string): string {
  // Hapus semua karakter non-digit
  let cleaned = number.replace(/\D/g, "");

  // Jika nomor dimulai dengan '0', ganti dengan kode negara Indonesia '62'
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  // Jika nomor belum memiliki kode negara, tambahkan '62'
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  // Tambahkan akhiran '@s.whatsapp.net'
  return cleaned + "@s.whatsapp.net";
}

export async function POST(request: Request) {
  const { to, message } = await request.json();
  const socket = getSocket();

  if (!socket) {
    return NextResponse.json(
      { error: "Koneksi WhatsApp tidak tersedia" },
      { status: 400 }
    );
  }

  if (!to || !message) {
    return NextResponse.json(
      { error: "Nomor penerima dan pesan harus diisi" },
      { status: 400 }
    );
  }

  const formattedTo = formatWhatsAppNumber(to);

  try {
    await socket.sendMessage(formattedTo, { text: message });
    return NextResponse.json({ message: "Pesan berhasil dikirim" });
  } catch (error) {
    console.error("Gagal mengirim pesan:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan: " + (error as Error).message },
      { status: 500 }
    );
  }
}
