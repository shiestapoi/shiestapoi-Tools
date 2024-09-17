export const dynamic = "force-dynamic";
import React from "react";
import { runCreateUser } from "@/lib/CreateUser";

export default async function CreateUser() {
  const result = await runCreateUser();
  return (
    <div>
      {result.success ? (
        <p>Berhasil: {result.message}</p>
      ) : (
        <p>Gagal: {result.message}</p>
      )}
      {result.data && (
        <div>
          <p>Email: {result.data.email}</p>
          <p>Nama: {result.data.name}</p>
        </div>
      )}
    </div>
  );
}
