"use client";

import React, { useEffect } from "react";

const ViewFacturas = ({ isOpen, onClose, facturas }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  // Depuración: Verificar si facturas está llegando correctamente
  console.log("Facturas recibidas:", facturas);

  // Calcular totales con valores seguros
  const totalUfNeto = facturas.reduce((acc, factura) => acc + (parseFloat(factura.ufNeto) || 0), 0);
  const totalUf = facturas.reduce((acc, factura) => acc + (parseFloat(factura.totalUf) || 0), 0);
  const totalClp = facturas.reduce((acc, factura) => acc + (parseFloat(factura.totalClp) || 0), 0);

  // Depuración: Verificar cálculos de totales
  console.log("Total UF Neto:", totalUfNeto);
  console.log("Total UF:", totalUf);
  console.log("Total CLP:", totalClp);
  console.log("¿Mostrar tabla de totales?", facturas.length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-700 p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-white mb-4">Facturas de esta gestión</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">Cerrar</button>

        {/* Tabla principal de facturas */}
        {facturas.length >= 0 && (
          <table key={facturas.length} className="min-w-full mt-4">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-white">N° Factura</th>
                <th className="px-4 py-2 text-left text-white">Fecha factura</th>
                <th className="px-4 py-2 text-left text-white">UF Neto</th>
                <th className="px-4 py-2 text-left text-white">Total UF</th>
                <th className="px-4 py-2 text-left text-white">Valor UF</th>
                <th className="px-4 py-2 text-left text-white">Total CLP</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura, index) => (
                <tr key={factura.id || index} className="border-t border-gray-600">
                  <td className="px-4 py-2 text-white">{factura.numeroFactura}</td>
                  <td className="px-4 py-2 text-white">{formatDate(factura.fecha)}</td>
                  <td className="px-4 py-2 text-white">{factura.ufNeto}</td>
                  <td className="px-4 py-2 text-white">{factura.totalUf}</td>
                  <td className="px-4 py-2 text-white">{formatCurrency(factura.valorUf)}</td>
                  <td className="px-4 py-2 text-white">{formatCurrency(factura.totalClp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Tabla separada para totales */}
        {facturas.length >= 2 && (
          <table className="min-w-full mt-4 border-t border-gray-600">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-white" colSpan={2}></th>
                <th className="px-4 py-2 text-left text-white">UF Neto</th>
                <th className="px-4 py-2 text-left text-white">Total UF</th>
                <th className="px-4 py-2 text-left text-white"></th>
                <th className="px-4 py-2 text-left text-white">Total CLP</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="px-4 py-2 text-white" colSpan={2}>Total</td>
                <td className="px-4 py-2 text-white">{totalUfNeto}</td>
                <td className="px-4 py-2 text-white">{totalUf}</td>
                <td className="px-4 py-2 text-white"></td>
                <td className="px-4 py-2 text-white">{formatCurrency(totalClp)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewFacturas;
