'use client'; // Marca este archivo como un componente del lado del cliente

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Cambia a next/navigation
import { initializeDatabase } from "@/lib/firestore"; // Importa la función que inicializa la base de datos

export default function HomePage() {
  const router = useRouter(); // Hook para redirigir a otra página

  useEffect(() => {
    const setupDatabase = async () => {
      // Llamamos a la función que inicializa la base de datos
      await initializeDatabase();
      
      // Una vez creada o verificada la base de datos, redirigimos a la página home
      router.push("/home"); 
    };

    setupDatabase(); // Ejecutamos la configuración
  }, [router]); // Dependemos de router para evitar problemas con su uso

  return <h1>Inicializando la base de datos...</h1>;
}
