"use client";

import { useState, useEffect } from "react";
import ListaGestiones from "./ListaGestiones";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase.config";

export default function BuscadorGestiones() {
  const [gestiones, setGestiones] = useState([]);
  const [searchParams, setSearchParams] = useState({
    nombreSitio: "",
    codigoSitio: "",
    ordenCompra: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const [filteredGestiones, setFilteredGestiones] = useState([]);

  useEffect(() => {
    const fetchGestiones = async () => {
      const querySnapshot = await getDocs(collection(db, "Gestiones"));
      const gestionesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGestiones(gestionesData);
      setFilteredGestiones(gestionesData);
    };

    fetchGestiones();
  }, []);

  useEffect(() => {
    const filterGestiones = () => {
      const { nombreSitio, codigoSitio, ordenCompra, estado, fechaDesde, fechaHasta } = searchParams;
      const filtered = gestiones.filter(gestion => {
        const fechaGestion = new Date(gestion.fecha); // Asumiendo que hay un campo 'fecha' en la gestión
        const isWithinDateRange = (!fechaDesde || fechaGestion >= new Date(fechaDesde)) &&
                                  (!fechaHasta || fechaGestion <= new Date(fechaHasta));
        return (
          (nombreSitio ? gestion.nombreSitio.toLowerCase().includes(nombreSitio.toLowerCase()) : true) &&
          (codigoSitio ? gestion.codigoSitio.toLowerCase().includes(codigoSitio.toLowerCase()) : true) &&
          (ordenCompra ? gestion.numeroOC.toLowerCase().includes(ordenCompra.toLowerCase()) : true) &&
          (estado ? gestion.estadoOC.toLowerCase() === estado.toLowerCase() : true) &&
          isWithinDateRange
        );
      });
      setFilteredGestiones(filtered);
    };

    filterGestiones();
  }, [searchParams, gestiones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Buscador de Gestiones</h2>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="nombreSitio"
          placeholder="Nombre de Sitio"
          value={searchParams.nombreSitio}
          onChange={handleChange}
          className="p-2 rounded"
        />
        <input
          type="text"
          name="codigoSitio"
          placeholder="Código de Sitio"
          value={searchParams.codigoSitio}
          onChange={handleChange}
          className="p-2 rounded"
        />
        <input
          type="text"
          name="ordenCompra"
          placeholder="Orden de Compra"
          value={searchParams.ordenCompra}
          onChange={handleChange}
          className="p-2 rounded"
        />
        <select
          name="estado"
          value={searchParams.estado}
          onChange={handleChange}
          className="p-2 rounded"
        >
          <option value="">Seleccionar Estado</option>
          <option value="Gestión en trámite">Gestión en trámite</option>
          <option value="Delayed">Delayed</option>
          <option value="Terminado">Terminado</option>
          <option value="Eliminado">Eliminado</option>
          <option value="Facturado">Facturado</option>
        </select>
        <input
          type="date"
          name="fechaDesde"
          value={searchParams.fechaDesde}
          onChange={handleChange}
          className="p-2 rounded"
        />
        <input
          type="date"
          name="fechaHasta"
          value={searchParams.fechaHasta}
          onChange={handleChange}
          className="p-2 rounded"
        />
      </div>
      <div>
        <ListaGestiones titulo="Todas las Gestiones" gestiones={filteredGestiones} />
      </div>
    </div>
  );
} 