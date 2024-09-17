export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToWhatsApp } from "@/lib/whatsapp";

export async function POST() {
  try {
    const result = await connectToWhatsApp();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Gagal menghubungkan ke WhatsApp:", error);
    return NextResponse.json(
      { error: "Gagal menghubungkan ke WhatsApp" },
      { status: 500 }
    );
  }
}
