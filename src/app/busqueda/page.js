'use client'; // Marca este archivo como un componente del lado del cliente

import BuscadorGestiones from "@/components/BuscadorGestiones";
import NavBar from "@/components/NavBar";
import { useRouter } from "next/navigation";

export default function BusquedaPage() {
  const router = useRouter();

  return (
    <div>
      <NavBar />
      <div className="flex justify-between p-4">
        <button
          onClick={() => router.push("/home")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Volver a Home
        </button>
      </div>
      <BuscadorGestiones />
    </div>
  );
} 