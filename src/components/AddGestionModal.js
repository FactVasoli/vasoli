"use client";

import { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase.config";

const REGIONES_CHILE = [
  { codigo: "XV", nombre: "XV - Región de Arica y Parinacota" },
  { codigo: "I", nombre: "I - Región de Tarapacá" },
  { codigo: "II", nombre: "II - Región de Antofagasta" },
  { codigo: "III", nombre: "III - Región de Atacama" },
  { codigo: "IV", nombre: "IV - Región de Coquimbo" },
  { codigo: "V", nombre: "V - Región de Valparaíso" },
  { codigo: "RM", nombre: "RM - Región Metropolitana" },
  { codigo: "VI", nombre: "VI - Región del Libertador General Bernardo O'Higgins" },
  { codigo: "VII", nombre: "VII - Región del Maule" },
  { codigo: "XVI", nombre: "XVI - Región de Ñuble" },
  { codigo: "VIII", nombre: "VIII - Región del Biobío" },
  { codigo: "IX", nombre: "IX - Región de La Araucanía" },
  { codigo: "XIV", nombre: "XIV - Región de Los Ríos" },
  { codigo: "X", nombre: "X - Región de Los Lagos" },
  { codigo: "XI", nombre: "XI - Región de Aysén" },
  { codigo: "XII", nombre: "XII - Región de Magallanes" }
];

export default function AddGestionModal({ isOpen, onClose, onSave, clientes, categoriaInicial, tipoCategoria }) {
  const [formData, setFormData] = useState({
    numeroOC: "",
    cliente: "",
    codigoSitio: "",
    nombreSitio: "",
    categoria: categoriaInicial,
    estadoOC: "",
    estadoGestion: "",
    fechaAsignacion: "",
    descripcionOC: "",
    valorNetoUF: "",
    region: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const estadosOC = [
    "Gestión en trámite",
    "Terminado sin facturar",
    "Facturado no pagado",
    "Terminado",
    "Delayed",
    "Eliminado no facturado",
    "Eliminado y cobrado",
    "M.Reuse"
  ];

  const estadosGestion = tipoCategoria === "especial" 
    ? ["Armado expediente", "Ingreso DOM", "Seguimiento DOM", "Rechazo DOM", "Re-Ingreso DOM", "Permiso", "Eliminado", "Facturado"]
    : ["Búsqueda", "Negociación", "I.Barrido", "Aprobado CP y ATP", "Carpeta legal", "Fiscalía", "Firmado CP y ATP", "Terminado sin facturar", "Eliminado", "Facturado"];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        numeroOC: "",
        cliente: "",
        codigoSitio: "",
        nombreSitio: "",
        categoria: categoriaInicial,
        estadoOC: "",
        estadoGestion: "",
        fechaAsignacion: "",
        descripcionOC: "",
        valorNetoUF: "",
        region: "",
      });
      setSuccessMessage("");
    }
  }, [isOpen, categoriaInicial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si no se ingresa una fecha, se establece la fecha de hoy
    const fechaAsignacion = formData.fechaAsignacion || new Date().toISOString().split('T')[0];

    await addDoc(collection(db, "Gestiones"), {
      ...formData,
      fechaAsignacion, // Usar la fecha asignada
      createdAt: new Date()
    });
    setSuccessMessage("La gestión fue guardada correctamente.");
    onSave();
    setFormData({
      numeroOC: "",
      cliente: "",
      codigoSitio: "",
      nombreSitio: "",
      categoria: categoriaInicial,
      estadoOC: "",
      estadoGestion: "",
      fechaAsignacion: "",
      descripcionOC: "",
      valorNetoUF: "",
      region: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-white" onClick={onClose}>✕</button>
        <h2 className="text-xl font-semibold text-white mb-4">Agregar Nueva Gestión</h2>
        {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Número OC"
              value={formData.numeroOC}
              onChange={(e) => setFormData({ ...formData, numeroOC: e.target.value })}
              className="input w-full"
            />
            <select
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Cliente *</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.nombre}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="UF neto"
              value={formData.valorNetoUF}
              onChange={(e) => setFormData({ ...formData, valorNetoUF: e.target.value })}
              className="input w-full"
              step="0.01"
            />
            <input
              type="text"
              value={formData.categoria}
              className="input w-full"
              disabled
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Código Sitio"
                value={formData.codigoSitio}
                onChange={(e) => setFormData({ ...formData, codigoSitio: e.target.value })}
                className="input w-full"
              />
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="input w-full"
              >
                <option value="">Seleccione Región *</option>
                {REGIONES_CHILE.map(region => (
                  <option key={region.codigo} value={region.codigo}>
                    {region.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Nombre Sitio"
                value={formData.nombreSitio}
                onChange={(e) => setFormData({ ...formData, nombreSitio: e.target.value })}
                className="input w-full"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={formData.estadoOC}
              onChange={(e) => setFormData({ ...formData, estadoOC: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Estado OC *</option>
              {estadosOC.map(estado => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <select
              value={formData.estadoGestion}
              onChange={(e) => setFormData({ ...formData, estadoGestion: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Estado Gestión *</option>
              {estadosGestion.map(estado => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Fecha Asignación"
              value={formData.fechaAsignacion}
              onChange={(e) => setFormData({ ...formData, fechaAsignacion: e.target.value })}
              className="input w-full"
            />
          </div>
          <textarea
            placeholder="Descripción OC"
            value={formData.descripcionOC}
            onChange={(e) => setFormData({ ...formData, descripcionOC: e.target.value })}
            className="input w-full h-32"
          />
          <button type="submit" className="button w-full">
            Guardar Gestión
          </button>
        </form>
      </div>
    </div>
  );
}