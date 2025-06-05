"use client";

export default function DesarrolloModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Funcionalidades en Desarrollo</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="text-gray-600">
          {/* Este texto se editará manualmente según sea necesario */}
          <p>
            Por mejorar:
            -Añadir columnas adicionales a BBNNs.
            -Añadir a NavBar más opciones para navegación.
            -Identificar información delicada faltante para que solo usuarios admin puedan ver.
            Por desarrollar:
            -Pizarra interactiva.
            -Alarmas / alertas.
            -Gestores y lógica de funcionamiento.
            -Módulo gestiones QMC, aparte del existente.
            -Lista de facturas.
            -O/C pendientes.
            -Gestión de boletas de gestores.
            -Informes.
          </p>
        </div>
      </div>
    </div>
  );
} 