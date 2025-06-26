"use client";

export default function DesarrolloModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: "black" }}>Funcionalidades en Desarrollo</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="text-gray-600">
          {/* Este texto se editará manualmente según sea necesario */}
          <p>Módulo O/C pendientes debe poder crear un string de texto con todas las gestiones que se encuentren en el mismo.</p>
          <p>Añadir columnas adicionales a BBNNs.</p>
          <p>Categorías alojarlas en DB para que usuarios admin puedan crear, editar y eliminar.</p>
          <p>Mejorar edición de gestiones en Categorías.</p>
          <p>Mejorar creación de gestiones en Categorías.</p>
          <p>Modulo Lista Facturas en Buscador</p>
          <p>Módulo QMC completo</p>
          <p>Usuarios tipo gestor. Módulo Mis boletas.</p>
          <p>Sección Informes (only admin).</p>
          <p>Informe de facturas pagadas / por pagar, según mes o rango de fechas.</p>
          <p> Calculadora de pagos de facturas.</p>
          <p>Modo claro/oscuro.</p>
          <p>En Categorias, habilitar vista por clientes.</p>
          <p>Crear Pizarra interactiva.</p>
        </div>
      </div>
    </div>
  );
} 