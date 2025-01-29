"use client";

import { useState, useEffect } from "react";
import EditGestionModal from "./EditGestionModal";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase.config";
import FacturarModal from "./FacturarModal";
import AddObservacion from "./AddObservacion";

export default function ListaGestiones({ titulo, gestiones }) {
  const [sortConfig, setSortConfig] = useState({ key: 'fechaAsignacion', direction: 'asc' });
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedGestion, setSelectedGestion] = useState(null);
  const [isFacturarModalOpen, setFacturarModalOpen] = useState(false);
  const [isAddObservacionModalOpen, setAddObservacionModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const sortedGestiones = [...gestiones].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] < b[sortConfig.key] ? -1 : 1;
    } else {
      return a[sortConfig.key] > b[sortConfig.key] ? -1 : 1;
    }
  });

  const handleSort = (key) => {
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

  const handleRetomar = async (gestion) => {
    if (confirm("¿Deseas retomar la gestión de este sitio? Se moverá a la lista 'Gestiones en Trámite'")) {
      const gestionRef = doc(db, "Gestiones", gestion.id);
      await updateDoc(gestionRef, {
        estadoOC: "Gestión en trámite"
      });
    }
  };

  const handleDetener = async (gestion) => {
    if (confirm("¿Deseas detener la gestión de este sitio? Se moverá a la lista 'Delayed'")) {
      const gestionRef = doc(db, "Gestiones", gestion.id);
      await updateDoc(gestionRef, {
        estadoOC: "Delayed"
      });
    }
  };

  const handleTerminar = async (gestion) => {
    if (confirm("Esta gestión se moverá a la lista 'Terminados sin Facturar' ¿Estás seguro?")) {
      const gestionRef = doc(db, "Gestiones", gestion.id);
      await updateDoc(gestionRef, {
        estadoOC: "Terminado sin facturar",
        estadoGestion: "Terminado sin facturar"
      });
    }
  };

  const handleEliminar = async (gestion) => {
    if (confirm("¿Deseas eliminar esta gestión? Se moverá a la lista 'Eliminados sin cobrar'")) {
      const gestionRef = doc(db, "Gestiones", gestion.id);
      await updateDoc(gestionRef, {
        estadoOC: "Eliminado no facturado",
        estadoGestion: "Eliminado"
      });
    }
  };

  const handleFacturar = (gestion) => {
    setSelectedGestion(gestion);
    setFacturarModalOpen(true);
  };

  const handlePagado = async (gestion) => {
    const confirmPagado = confirm("¿La factura de esta gestión ha sido pagada?");
    if (confirmPagado) {
      const gestionRef = doc(db, "Gestiones", gestion.id);
      if (gestion.estadoOC === "Eliminado no facturado"){
        await updateDoc(gestionRef, {
          estadoOC: "Eliminado y cobrado"
        });
      }
      else if (gestion.estadoGestion === "Facturado") {
        await updateDoc(gestionRef, {
          estadoOC: "Terminado",
          estadoGestion: "Facturado"
        });
      }
    }
  };

  const handleAddObservacionClick = (gestion) => {
    setSelectedGestion(gestion);
    setAddObservacionModalOpen(true);
  };

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

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">{titulo}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-600">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '55px' }}>N°</th>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '72px' }} onClick={() => handleSort('numeroOC')}>
                Orden de Compra
                <span className={`ml-2 ${sortConfig.key === 'numeroOC' ? (sortConfig.direction === 'asc' ? 'text-green-500' : 'text-green-500') : 'text-white'}`}>
                  {sortConfig.key === 'numeroOC' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '←'}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '93px' }} onClick={() => handleSort('codigoSitio')}>
                ID
                <span className={`ml-2 ${sortConfig.key === 'codigoSitio' ? (sortConfig.direction === 'asc' ? 'text-green-500' : 'text-green-500') : 'text-white'}`}>
                  {sortConfig.key === 'codigoSitio' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '←'}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '106px' }} onClick={() => handleSort('nombreSitio')}>
                Nombre Sitio
                <span className={`ml-2 ${sortConfig.key === 'nombreSitio' ? (sortConfig.direction === 'asc' ? 'text-green-500' : 'text-green-500') : 'text-white'}`}>
                  {sortConfig.key === 'nombreSitio' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '←'}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '76px' }} onClick={() => handleSort('fechaAsignacion')}>
                Fecha Asignación
                <span className={`ml-2 ${sortConfig.key === 'fechaAsignacion' ? (sortConfig.direction === 'asc' ? 'text-green-500' : 'text-green-500') : 'text-white'}`}>
                  {sortConfig.key === 'fechaAsignacion' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '←'}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '55px' }} onClick={() => handleSort('region')}>
                Región
                <span className={`ml-2 ${sortConfig.key === 'region' ? (sortConfig.direction === 'asc' ? 'text-green-500' : 'text-green-500') : 'text-white'}`}>
                  {sortConfig.key === 'region' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '←'}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '114px' }} onClick={() => handleSort('estadoGestion')}>
                Estado
                <span className={`ml-2 ${sortConfig.key === 'estadoGestion' ? (sortConfig.direction === 'asc' ? 'text-green-500' : 'text-green-500') : 'text-white'}`}>
                  {sortConfig.key === 'estadoGestion' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '←'}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-600" style={{ width: '440px' }}>Observaciones</th>
              {isAdmin && (
                <th className="px-4 py-2 border border-gray-600" style={{ width: '100px' }}>
                  UF Neto
                </th>
              )}
              <th className="px-4 py-2 border border-gray-600" style={{ width: '50px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedGestiones.map((gestion, index) => (
              <tr key={gestion.id} className="border-t border-gray-600 cursor-pointer hover:bg-gray-700" onClick={() => handleEditClick(gestion)}>
                <td className="px-4 py-2 border border-gray-600">{index + 1}</td>
                <td className="px-4 py-2 border border-gray-600">{gestion.numeroOC}</td>
                <td className="px-4 py-2 border border-gray-600">{gestion.codigoSitio}</td>
                <td className="px-4 py-2 border border-gray-600">{gestion.nombreSitio}</td>
                <td className="px-4 py-2 border border-gray-600">{formatDate(gestion.fechaAsignacion)}</td>
                <td className="px-4 py-2 border border-gray-600">{gestion.region}</td>
                <td className="px-4 py-2 border border-gray-600">{gestion.estadoGestion}</td>
                <td className="px-4 py-2 border border-gray-600">
                  <div className="h-[75px] overflow-y-hidden" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddObservacionClick(gestion);
                      }}
                      className="text-white-500 hover:text-yellow-300"
                    >
                      {gestion.observaciones}
                    </button>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 border border-gray-600">{gestion.valorNetoUF}</td>
                )}
                <td className="px-4 py-2 border border-gray-600">
                  {titulo === "Gestiones en Trámite" && (
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTerminar(gestion);
                        }}
                        className="text-green-500 hover:text-green-700">Terminar</button><br />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDetener(gestion);
                        }}
                        className="text-yellow-500 hover:text-yellow-700">Detener</button><br />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminar(gestion);
                        }}
                        className="text-red-500 hover:text-red-700">Eliminar</button>
                    </div>
                  )}
                  {titulo === "Delayed" && (
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetomar(gestion);
                        }}
                        className="text-blue-500 hover:text-blue-700">Retomar</button><br />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTerminar(gestion);
                        }}
                        className="text-green-500 hover:text-green-700">Terminar</button><br />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminar(gestion);
                        }}
                        className="text-red-500 hover:text-red-700">Eliminar</button>
                    </div>
                  )}
                  {titulo === "Terminados sin Facturar y Facturados no Pagados" && (
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFacturar(gestion);
                        }}
                        className="text-blue-500 hover:text-green-700">Facturar</button><br />
                      {gestion.estadoGestion === "Facturado" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePagado(gestion);
                          }}
                          className="text-green-500 hover:text-green-700">Pagado</button>
                      )}
                    </div>
                  )}
                  {titulo === "Eliminados sin cobrar" && (
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetomar(gestion);
                        }}
                        className="text-blue-500 hover:text-blue-700">Retomar</button><br />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFacturar(gestion);
                        }}
                        className="text-blue-500 hover:text-green-700">Facturar</button><br />
                      {gestion.estadoGestion === "Facturado" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePagado(gestion);
                          }}
                          className="text-green-500 hover:text-green-700">Pagado</button>
                      )}
                    </div>
                  )}
                  {titulo === "Terminados y cobrados" && (
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFacturar(gestion);
                        }}
                        className="text-blue-500 hover:text-green-700">Facturar</button>
                    </div>
                  )}
                </td>
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
          // Aquí puedes agregar lógica para refrescar la lista si es necesario
        }}
      />
      <FacturarModal
        isOpen={isFacturarModalOpen}
        onClose={() => setFacturarModalOpen(false)}
        gestion={selectedGestion}
      />
      <AddObservacion
        isOpen={isAddObservacionModalOpen}
        onClose={() => setAddObservacionModalOpen(false)}
        gestion={selectedGestion}
        onSave={() => {
          setAddObservacionModalOpen(false);
          // Aquí puedes agregar lógica para refrescar la lista si es necesario
        }}
      />
    </div>
  );
}