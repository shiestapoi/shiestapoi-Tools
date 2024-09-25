"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function DevicePage() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Menunggu Koneksi");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [numberPhoneConnection, setNumberPhoneConnection] = useState<
    string | null
  >(null);
  const effectRan = useRef(false);
  useEffect(() => {
    if (effectRan.current === false) {
      try {
        const eventSource = new EventSource("/api/whatsapp/events");
        console.log(eventSource); 
        eventSource.addEventListener("connectionStatus", (event) => {
          const data = JSON.parse(event.data);
          setStatus(data.status);
          if (data.status === "open") {
            setQrCode(null);
          }
        });

        eventSource.addEventListener("numberPhoneConnection", (event) => {
          const data = JSON.parse(event.data);
          setNumberPhoneConnection(data.numberPhoneConnection);
        });

        eventSource.addEventListener("qrCode", (event) => {
          const data = JSON.parse(event.data);
          setQrCode(data.qrCode);
        });

        eventSource.addEventListener("version", (event) => {
          const data = JSON.parse(event.data);
          setVersion(data.version);
        });

        eventSource.addEventListener("message", (event) => {
          const message = JSON.parse(event.data);
          console.log(message);
        });

        return () => {
          eventSource.close();
        };
      } catch (error) {
        setError("Kesalahan inisialisasi koneksi WhatsApp");
      }
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:
          "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/img/bg-device.jpg')",
        backgroundSize: "100%",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-gray-900 p-5 rounded-lg shadow-md text-center flex flex-col items-center justify-center">
        <h1 className="text-green-400 text-2xl font-bold">
          Scan WhatsApp QR Code
        </h1>
        {error ? (
          <div className="text-red-500 font-semibold mt-10">
            <p>Terjadi kesalahan saat mengambil kode QR.</p>
            <p>Silakan coba lagi setelah membuka aplikasi WhatsApp Anda.</p>
          </div>
        ) : status === "open" || (numberPhoneConnection && numberPhoneConnection.length > 0) ? (
          <div className="text-green-500 font-semibold mt-10 mb-10">
            Terhubung dengan nomor WhatsApp: {numberPhoneConnection}
          </div>
        ) : qrCode ? (
          <>
            <p className="mb-2 mt-2">
              Status: <span className="text-green-500">{status}</span>
            </p>
            <Image
              src={qrCode}
              alt="Kode QR WhatsApp"
              width={300}
              height={300}
              className="rounded-lg mb-5"
            />
          </>
        ) : (
          <div className="flex items-center mt-10 justify-center mb-10 text-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-green-500"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading ...
          </div>
        )}
        <div className="text-center">
          <h1 className="text-gray-400 text-sm font-bold">
            Version: <span className="text-green-500">{version}</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
