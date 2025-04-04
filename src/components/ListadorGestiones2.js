"use client";

import { useState, useEffect } from "react";
import EditGestionModal from "./EditGestionModal";
import ViewFacturas from "./ViewFacturas";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase.config";
import { doc, getDoc } from "firebase/firestore";

export default function ListadorGestiones2({ gestiones }) {
    const [sortConfig, setSortConfig] = useState({ key: 'categoria', direction: 'asc' });
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedGestion, setSelectedGestion] = useState(null);
    const [viewFacturasOpen, setViewFacturasOpen] = useState(false);
    const [facturas, setFacturas] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [valorUfHoy, setValorUfHoy] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
    };

    useEffect(() => {
        const obtenerValorUfHoy = async () => {
            try {
                // Obtener la fecha de hoy en formato dd-mm-yyyy
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0'); // Asegurar dos dígitos para el día
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Asegurar dos dígitos para el mes
                const year = today.getFullYear();
                const fechaHoy = `${day}-${month}-${year}`; // Formato dd-mm-yyyy
    
                // Realizar la solicitud a la API
                const response = await fetch(`https://mindicador.cl/api/uf/${fechaHoy}`);
                const data = await response.json();
    
                // Verificar si se obtuvo un valor válido
                if (data.serie && data.serie.length > 0) {
                    setValorUfHoy(data.serie[0].valor); // Establecer el valor de la UF
                } else {
                    console.warn("No se encontró el valor UF para la fecha de hoy. Usando valor por defecto.");
                    setValorUfHoy(500); // Valor por defecto en caso de error
                }
            } catch (error) {
                console.error("Error al obtener el valor UF del día:", error);
                setValorUfHoy(800); // Valor por defecto en caso de error
            }
        };
    
        obtenerValorUfHoy();
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
          const user = auth.currentUser;
          if (user) {
            const userDoc = await getDoc(doc(db, "Usuarios", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setIsAdmin(userData.cargo === "admin");
            }
          }
        };
    
        fetchUserRole();
      }, []);

    const sortedGestiones = [...gestiones].sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue === "" && bValue === "") return 0;
        if (aValue === "") return 1;
        if (bValue === "") return -1;

        const isNumericField = sortConfig.key === "valorNetoUF" || sortConfig.key === "numeroFactura";
        const aNumeric = isNumericField ? parseFloat(aValue.replace(/[^0-9.-]/g, "")) || 0 : aValue;
        const bNumeric = isNumericField ? parseFloat(bValue.replace(/[^0-9.-]/g, "")) || 0 : bValue;

        if (aNumeric < bNumeric) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aNumeric > bNumeric) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleEditClick = (gestion) => {
        setSelectedGestion(gestion);
        setEditModalOpen(true);
    };

    const handleViewFacturas = async (gestion) => {
        const facturasRef = collection(db, "Facturas");
        const q = query(facturasRef, where("codigoSitio", "==", gestion.codigoSitio), where("ordenCompra", "==", gestion.numeroOC));
        const querySnapshot = await getDocs(q);

        const facturasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setFacturas(facturasData);
        setViewFacturasOpen(true);
    };

    return (
        <div>
            <div className="w-full px-4 py-8 overflow-x-auto">
                <div className="flex items-center mb-4">
                    <div className="bg-gray-700 text-white px-4 py-2 rounded mr-4">
                        Valor UF hoy: {valorUfHoy ? valorUfHoy : "Cargando..."}
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            {showDetails ? "Ocultar detalles" : "Mostrar más detalles"}
                        </button>
                    )}
                </div>

                <table className="min-w-full table-auto border-collapse border border-gray-600 mt-4 bg-gray-800">
                    <thead>
                        <tr>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('cliente')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    Cliente
                                    {sortConfig.key === 'cliente' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('codigoSitio')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    Código Sitio
                                    {sortConfig.key === 'codigoSitio' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('nombreSitio')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    Nombre Sitio
                                    {sortConfig.key === 'nombreSitio' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('numeroOC')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    N° OC
                                    {sortConfig.key === 'numeroOC' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('fechaAsignacion')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    Fecha Asignación
                                    {sortConfig.key === 'fechaAsignacion' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                colSpan={2}
                                onClick={() => requestSort('estadoOC')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    Estado
                                    {sortConfig.key === 'estadoOC' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('categoria')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    Categoría
                                    {sortConfig.key === 'categoria' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('numeroFactura')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    N° Factura
                                    {sortConfig.key === 'numeroFactura' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            {showDetails && (
                                <th
                                    className="px-4 py-2 border border-gray-600 bg-gray-700"
                                    onClick={() => requestSort('fechaFacturacion')}
                                >
                                    <span className="hover:text-green-500 transition-colors duration-200">
                                        Fecha Facturación
                                        {sortConfig.key === 'fechaFacturacion' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                    </span>
                                </th>
                            )}
                            <th
                                className="px-4 py-2 border border-gray-600 bg-gray-700"
                                onClick={() => requestSort('valorNetoUF')}
                            >
                                <span className="hover:text-green-500 transition-colors duration-200">
                                    Valor Neto UF
                                    {sortConfig.key === 'valorNetoUF' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                </span>
                            </th>
                            {showDetails && (
                                <>
                                    <th
                                        className="px-4 py-2 border border-gray-600 bg-gray-700"
                                        onClick={() => requestSort('valorUfFecha')}
                                    >
                                        <span className="hover:text-green-500 transition-colors duration-200">
                                            Valor UF en fecha
                                            {sortConfig.key === 'valorUfFecha' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                        </span>
                                    </th>
                                    <th
                                        className="px-4 py-2 border border-gray-600 bg-gray-700"
                                        onClick={() => requestSort('totalUf')}
                                    >
                                        <span className="hover:text-green-500 transition-colors duration-200">
                                            Total UF
                                            {sortConfig.key === 'totalUf' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                        </span>
                                    </th>
                                    <th
                                        className="px-4 py-2 border border-gray-600 bg-gray-700"
                                        onClick={() => requestSort('totalClp')}
                                    >
                                        <span className="hover:text-green-500 transition-colors duration-200">
                                            Total CLP
                                            {sortConfig.key === 'totalClp' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ←'}
                                        </span>
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedGestiones.map((gestion) => (
                            <tr
                                key={gestion.id}
                                className="border-t border-gray-600 cursor-pointer hover:bg-gray-700"
                                onClick={() => handleEditClick(gestion)}
                            >
                                <td className="px-4 py-2 border border-gray-600">{gestion.cliente}</td>
                                <td className="px-4 py-2 border border-gray-600">{gestion.codigoSitio}</td>
                                <td className="px-4 py-2 border border-gray-600">{gestion.nombreSitio}</td>
                                <td className="px-4 py-2 border border-gray-600">{gestion.numeroOC}</td>
                                <td className="px-4 py-2 border border-gray-600">{gestion.fechaAsignacion}</td>
                                <td className="px-4 py-2 border border-gray-600">{gestion.estadoOC}</td>
                                <td className="px-4 py-2 border border-gray-600">{gestion.estadoGestion}</td>
                                <td className="px-4 py-2 border border-gray-600">{gestion.categoria}</td>
                                <td
                                    className="px-4 py-2 border border-gray-600 cursor-pointer hover:bg-gray-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewFacturas(gestion);
                                    }}
                                >
                                    {gestion.numeroFactura}
                                </td>
                                {showDetails && (
                                    <td className="px-4 py-2 border border-gray-600">
                                        {gestion.fechasFacturacion && gestion.fechasFacturacion.length > 0 ? (
                                            gestion.fechasFacturacion.map((fecha, index) => (
                                                <span key={index}>
                                                    {formatDate(fecha.fecha)}
                                                    {index < gestion.fechasFacturacion.length - 1 ? <br /> : ""}
                                                </span>
                                            ))
                                        ) : gestion.fechaEliminacion ? (
                                            formatDate(gestion.fechaEliminacion)
                                        ) : (
                                            ""
                                        )}
                                    </td>
                                )}
                                <td className="px-4 py-2 border border-gray-600">{gestion.valorNetoUF}</td>
                                {showDetails && (
                                    <>
                                        <td className="px-4 py-2 border border-gray-600">
                                            {gestion.fechasFacturacion && gestion.fechasFacturacion.length > 0 ? gestion.fechasFacturacion[0].valorUf : ""}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-600">
                                            {(gestion.valorNetoUF * 1.19).toFixed(2) || ""}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-600">
                                            {gestion.fechasFacturacion && gestion.fechasFacturacion.length > 0 ? formatCurrency(gestion.valorNetoUF * 1.19 * gestion.fechasFacturacion[0].valorUf) : formatCurrency(gestion.valorNetoUF * 1.19 * valorUfHoy)}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EditGestionModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                gestion={selectedGestion}
                onSave={() => {
                    setEditModalOpen(false);
                }}
            />
            <ViewFacturas
                isOpen={viewFacturasOpen}
                onClose={() => setViewFacturasOpen(false)}
                facturas={facturas}
            />
        </div>
    );
}