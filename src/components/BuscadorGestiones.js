"use client";

import { useState, useEffect } from "react";

export default function BuscadorGestiones({ gestiones, onFilter }) {
  const [searchParams, setSearchParams] = useState({
    nombreSitio: "",
    codigoSitio: "",
    ordenCompra: "",
    estado: "",
    categoria: "", // Nuevo campo para la categoría
  });
  const [showSinOC, setShowSinOC] = useState(false);

  // Lista de categorías disponibles
  const categorias = [
    "Sitios nuevos",
    "Renegociación",
    "C13",
    "Bienes nacionales",
    "Permiso de instalación",
    "Aviso de instalación",
    "Obra menor",
    "Recepción de obras",
    "DAS",
    "Misceláneos",
  ];

  useEffect(() => {
    const filterGestiones = () => {
      const { nombreSitio, codigoSitio, ordenCompra, estado, categoria } = searchParams;
      const filtered = gestiones.filter(gestion => {
        const matchesSinOC = showSinOC ? (!gestion.numeroOC || gestion.numeroOC.trim() === "") : true;
        return (
          matchesSinOC &&
          (nombreSitio ? gestion.nombreSitio.toLowerCase().includes(nombreSitio.toLowerCase()) : true) &&
          (codigoSitio ? gestion.codigoSitio.toLowerCase().includes(codigoSitio.toLowerCase()) : true) &&
          (ordenCompra ? gestion.numeroOC.toLowerCase().includes(ordenCompra.toLowerCase()) : true) &&
          (estado ? gestion.estadoOC.toLowerCase() === estado.toLowerCase() : true) &&
          (categoria ? gestion.categoria === categoria : true) // Filtro por categoría
        );
      });
      onFilter(filtered); // Llamamos a la función onFilter con las gestiones filtradas
    };

    filterGestiones();
  }, [searchParams, gestiones, onFilter, showSinOC]); // Solo se ejecuta cuando searchParams, gestiones o onFilter cambian

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Buscador de Gestiones</h2>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showSinOC"
            checked={showSinOC}
            onChange={(e) => setShowSinOC(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showSinOC" className="text-white">
            Mostrar gestiones sin Orden de compra
          </label>
        </div>
        <input
          type="text"
          name="nombreSitio"
          placeholder="Nombre de Sitio"
          value={searchParams.nombreSitio}
          onChange={handleChange}
          className="p-2 rounded text-black" // Texto negro
        />
        <input
          type="text"
          name="codigoSitio"
          placeholder="Código de Sitio"
          value={searchParams.codigoSitio}
          onChange={handleChange}
          className="p-2 rounded text-black" // Texto negro
        />
        <input
          type="text"
          name="ordenCompra"
          placeholder="Orden de Compra"
          value={searchParams.ordenCompra}
          onChange={handleChange}
          className="p-2 rounded text-black" // Texto negro
        />
        <select
          name="estado"
          value={searchParams.estado}
          onChange={handleChange}
          className="p-2 rounded text-black" // Texto negro
        >
          <option value="">Seleccionar Estado</option>
          <option value="Gestión en trámite">Gestión en trámite</option>
          <option value="Delayed">Delayed</option>
          <option value="Terminado sin facturar">Terminado sin facturar</option>
          <option value="Facturado no pagado">Facturado no pagado</option>
          <option value="Terminado">Terminado</option>
          <option value="Eliminado no facturado">Eliminado no facturado</option>
          <option value="Eliminado y cobrado">Eliminado y cobrado</option>
        </select>
        {/* Nuevo combobox para categorías */}
        <select
          name="categoria"
          value={searchParams.categoria}
          onChange={handleChange}
          className="p-2 rounded text-black" // Texto negro
        >
          <option value="">Seleccionar Categoría</option>
          {categorias.map((categoria, index) => (
            <option key={index} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}