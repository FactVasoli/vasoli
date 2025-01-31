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
  { codigo: "XII", nombre: "XII - Región de Magallanes" },
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
    "M.Reuse",
  ];

  const estadosGestion =
    tipoCategoria === "especial"
      ? [
          "Armado expediente",
          "Ingreso DOM",
          "Seguimiento DOM",
          "Rechazo DOM",
          "Re-Ingreso DOM",
          "Permiso",
          "Eliminado",
          "Facturado",
        ]
      : [
          "Búsqueda",
          "Negociación",
          "I.Barrido",
          "Aprobado CP y ATP",
          "Carpeta legal",
          "Fiscalía",
          "Firmado CP y ATP",
          "Terminado sin facturar",
          "Eliminado",
          "Facturado",
        ];

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

    const fechaAsignacion = formData.fechaAsignacion || new Date().toISOString().split("T")[0];

    await addDoc(collection(db, "Gestiones"), {
      ...formData,
      fechaAsignacion,
      createdAt: new Date(),
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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh" }}
      >
        <button
          className="absolute top-2 right-2 text-white text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Agregar Nueva Gestión</h2>
        {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Número OC</label>
              <input
                type="text"
                value={formData.numeroOC}
                onChange={(e) => setFormData({ ...formData, numeroOC: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Cliente</label>
              <select
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.nombre}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Código Sitio</label>
              <input
                type="text"
                value={formData.codigoSitio}
                onChange={(e) => setFormData({ ...formData, codigoSitio: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Región</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Región</option>
                {REGIONES_CHILE.map((region) => (
                  <option key={region.codigo} value={region.codigo}>
                    {region.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Nombre Sitio</label>
              <input
                type="text"
                value={formData.nombreSitio}
                onChange={(e) => setFormData({ ...formData, nombreSitio: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">UF Neto</label>
              <input
                type="number"
                value={formData.valorNetoUF}
                onChange={(e) => setFormData({ ...formData, valorNetoUF: e.target.value })}
                className="input w-full"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Estado OC</label>
              <select
                value={formData.estadoOC}
                onChange={(e) => setFormData({ ...formData, estadoOC: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Estado OC</option>
                {estadosOC.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Estado Gestión</label>
              <select
                value={formData.estadoGestion}
                onChange={(e) => setFormData({ ...formData, estadoGestion: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Estado Gestión</option>
                {estadosGestion.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Fecha Asignación</label>
              <input
                type="date"
                value={formData.fechaAsignacion}
                onChange={(e) => setFormData({ ...formData, fechaAsignacion: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-1">Descripción OC</label>
            <textarea
              value={formData.descripcionOC}
              onChange={(e) => setFormData({ ...formData, descripcionOC: e.target.value })}
              className="input w-full h-32"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Guardar Gestión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
