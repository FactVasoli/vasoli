"use client";

import { useState, useEffect } from "react";
import EditGestionModal from "./EditGestionModal";
import { updateDoc, doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/firebase.config";
import FacturarModal from "./FacturarModal";
import AddObservacion from "./AddObservacion";
import ViewFacturas from './ViewFacturas';

export default function ListaGestiones({ titulo, gestiones, tipoCategoria }) {
  const [sortConfig, setSortConfig] = useState({ key: 'fechaAsignacion', direction: 'asc' });
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedGestion, setSelectedGestion] = useState(null);
  const [isFacturarModalOpen, setFacturarModalOpen] = useState(false);
  const [isAddObservacionModalOpen, setAddObservacionModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalUFNeto, setTotalUFNeto] = useState(0);
  const [totalCLP, setTotalCLP] = useState(0);
  const [totalCLPTramites, setTotalCLPTramites] = useState(0);
  const [totalUFNetoFacts, setTotalUFNetoFacts] = useState(0);
  const [totalCLPFacts, setTotalCLPFacts] = useState(0);
  const [totalGestionesSinFacturar, setTotalGestionesSinFacturar] = useState(0);
  const [totalGestionesFacturadas, setTotalGestionesFacturadas] = useState(0);
  const [totalCLPEliminados, setTotalCLPEliminados] = useState(0);
  const [valorUF, setValorUF] = useState(0);
  const [viewFacturasOpen, setViewFacturasOpen] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [ocultarEliminadas, setOcultarEliminadas] = useState(true);

  const estadosGestionNormal = [
    "Iniciado",
    "Búsqueda",
    "Negociación",
    "Aprobado CP y ATP",
    "Carpeta legal",
    "Fiscalía",
    "Firmado CP y ATP",
    "Terminado sin facturar",
    "Eliminado",
    "Facturado",
  ];

  const estadosGestionEspecial = [
    "Armado expediente",
    "Ingreso DOM",
    "Seguimiento DOM",
    "Rechazo DOM",
    "Re-Ingreso DOM",
    "Permiso",
    "Eliminado",
    "Facturado",
  ];

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
        estadoOC: "Gestión en trámite",
        fechaEliminacion: null,
        totalCLPEliminado: null,
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
    const confirmEliminar = confirm("¿Desea eliminar esta gestión? Se moverá a la lista 'Eliminados sin cobrar'");
    if (!confirmEliminar) {
      return; // Fin del proceso si se cancela
    }

    const isToday = confirm("¿La fecha de eliminación es hoy?");
    let formattedDate;

    if (isToday) {
      const today = new Date();
      formattedDate = today.toLocaleDateString('es-CL').split('/').reverse().join('-'); // Formato dd-mm-yyyy
    } else {
      formattedDate = prompt("Ingrese fecha en formato dd-mm-yyyy:");
      // Validar el formato de la fecha ingresada
      const datePattern = /^\d{2}-\d{2}-\d{4}$/;
      if (!datePattern.test(formattedDate)) {
        alert("Formato de fecha inválido. Debe ser dd-mm-yyyy.");
        return;
      }
    }

    // Obtener el valor de la UF en la fecha de eliminación
    const response = await fetch(`https://mindicador.cl/api/uf/${formattedDate}`);
    const data = await response.json();

    // Verificar si hay datos en la serie
    if (data.serie && data.serie.length > 0) {
      const valorUFEliminacion = data.serie[0].valor;

      const totalCLPEliminado = (parseFloat(gestion.valorNetoUF) * 1.19) * valorUFEliminacion;

      const gestionRef = doc(db, "Gestiones", gestion.id);
      await updateDoc(gestionRef, {
        estadoOC: "Eliminado no facturado",
        estadoGestion: "Eliminado",
        fechaEliminacion: formattedDate,
        totalCLPEliminado: totalCLPEliminado,
      });
    } else {
      alert("No se pudo obtener el valor de la UF para la fecha seleccionada.");
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  };

  const handleAddObservacionClick = (gestion) => {
    setSelectedGestion(gestion);
    setAddObservacionModalOpen(true);
  };

  const handleVerFactura = async (gestion) => {
    const facturasRef = collection(db, "Facturas");
    const q = query(facturasRef, where("codigoSitio", "==", gestion.codigoSitio), where("ordenCompra", "==", gestion.numeroOC));
    const querySnapshot = await getDocs(q);
    
    const facturas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    setFacturas(facturas);
    setViewFacturasOpen(true);
  };

  const handleAvanzarEstado = async (gestion) => {
    const estadosGestion = tipoCategoria === "especial" ? estadosGestionEspecial : estadosGestionNormal;
    const indiceActual = estadosGestion.indexOf(gestion.estadoGestion);
    
    if (indiceActual < estadosGestion.length - 1) {
      const nuevoEstado = estadosGestion[indiceActual + 1];
      const gestionRef = doc(db, "Gestiones", gestion.id);
      await updateDoc(gestionRef, {
        estadoGestion: nuevoEstado
      });
    }
  };

  const handleRetrocederEstado = async (gestion) => {
    const estadosGestion = tipoCategoria === "especial" ? estadosGestionEspecial : estadosGestionNormal;
    const indiceActual = estadosGestion.indexOf(gestion.estadoGestion);
    
    if (indiceActual > 0) {
      const nuevoEstado = estadosGestion[indiceActual - 1];
      const gestionRef = doc(db, "Gestiones", gestion.id);
      await updateDoc(gestionRef, {
        estadoGestion: nuevoEstado
      });
    }
  };

  useEffect(() => {
    const calcularTotalUFNeto = () => {
      const total = gestiones.reduce((acc, gestion) => acc + (parseFloat(gestion.valorNetoUF) || 0), 0);
      setTotalUFNeto(total);
    };

    calcularTotalUFNeto();
  }, [gestiones]);

  useEffect(() => {
    const fetchValorUF = async () => {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-CL').split('/').reverse().join('-'); // dd-mm-yyyy
      const response = await fetch(`https://mindicador.cl/api/uf/${formattedDate}`);
      const data = await response.json();
      if (data.serie && data.serie.length > 0) {
        setValorUF(data.serie[0].valor);
      }
    };

    fetchValorUF();
  }, []);

  useEffect(() => {
    const calcularTotalesFacturadas = async () => {
      if (titulo === "Terminados sin Facturar y Facturados no Pagados") {
        const totalUFNetoTerminados = gestiones.reduce((acc, gestion) => {
          return acc + (gestion.estadoGestion === "Terminado sin facturar" ? parseFloat(gestion.valorNetoUF) : 0);
        }, 0);
        setTotalUFNeto(totalUFNetoTerminados);

        const totalCLPTerminados = (totalUFNetoTerminados * 1.19) * valorUF;
        setTotalCLP(totalCLPTerminados);

        const facturasPromises = gestiones.map(async (gestion) => {
          if (gestion.estadoGestion === "Facturado") {
            const facturasRef = collection(db, "Facturas");
            const q = query(facturasRef, where("codigoSitio", "==", gestion.codigoSitio), where("ordenCompra", "==", gestion.numeroOC));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
          return [];
        });

        const facturasList = await Promise.all(facturasPromises);
        const totalUFNetoFacts = facturasList.reduce((acc, facturas) => {
          return acc + facturas.reduce((sum, factura) => sum + (parseFloat(factura.ufNeto) || 0), 0);
        }, 0);
        setTotalUFNetoFacts(totalUFNetoFacts);

        const totalCLPFacts = facturasList.reduce((acc, facturas) => {
          return acc + facturas.reduce((sum, factura) => sum + (parseFloat(factura.totalClp) || 0), 0);
        }, 0);
        setTotalCLPFacts(totalCLPFacts);

        setTotalGestionesSinFacturar(gestiones.filter(gestion => gestion.estadoGestion === "Terminado sin facturar").length);
        setTotalGestionesFacturadas(gestiones.filter(gestion => gestion.estadoGestion === "Facturado").length);
      }

      // Calcular total CLP para "Gestiones en Trámite" y "Delayed"
      if (titulo === "Gestiones en Trámite" || titulo === "Delayed") {
        const totalCLPTramites = (totalUFNeto * 1.19) * valorUF;
        setTotalCLPTramites(totalCLPTramites);
      }

      // Calcular total CLP para "Eliminados sin cobrar"
      if (titulo === "Eliminados sin cobrar") {
        const totalCLPEliminados = gestiones.reduce((acc, gestion) => {
          return acc + (gestion.totalCLPEliminado || 0);
        }, 0);
        setTotalCLPEliminados(totalCLPEliminados);
      }
    };

    calcularTotalesFacturadas();
  }, [gestiones, titulo, valorUF, totalUFNeto]);

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

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  // Función para eliminar definitivamente una gestión
  const handleEliminarDefinitivo = async (gestion) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta gestión de forma permanente? Esta acción no se puede deshacer.")) {
      await deleteDoc(doc(db, "Gestiones", gestion.id));
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-white">{titulo}</h2>
        </div>
          {titulo === "Terminados y cobrados" && (
            <label className="flex items-center mr-4 text-white">
              <input
                type="checkbox"
                checked={ocultarEliminadas}
                onChange={e => setOcultarEliminadas(e.target.checked)}
                className="mr-2"
              />
              Ocultar gestiones eliminadas
            </label>
          )}
        <button
          onClick={toggleMinimize}
        >
          <h1 className="text-white bg-gray-800 hover:bg-gray-800 rounded-md px-2 py-1 font-bold">{isMinimized ? "+" : "-"}</h1>
        </button>
      </div>
      {!isMinimized && (
        <div>
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
                  {(titulo === "Eliminados sin cobrar" || titulo === "Terminados y cobrados") && (
                    <th className="px-4 py-2 border border-gray-600" style={{ width: '70px' }}>Eliminar</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedGestiones
                  .filter(gestion => {
                    if (titulo === "Terminados y cobrados" && ocultarEliminadas) {
                      return gestion.estadoOC !== "Eliminado y cobrado" && gestion.estadoOC !== "Eliminado no facturado";
                    }
                    return true;
                  })
                  .map((gestion, index) => (
                  <tr 
                    key={gestion.id} 
                    className={`border-t border-gray-600 cursor-pointer hover:bg-gray-700 ${gestion.estadoOC === "Eliminado y cobrado" ? 'bg-red-900 hover:bg-red-800' : ''}`} 
                    onClick={() => handleEditClick(gestion)}
                  >
                    <td className="px-4 py-2 border border-gray-600">{index + 1}</td>
                    <td className="px-4 py-2 border border-gray-600">{gestion.numeroOC}</td>
                    <td className="px-4 py-2 border border-gray-600">{gestion.codigoSitio}</td>
                    <td className="px-4 py-2 border border-gray-600">{gestion.nombreSitio}</td>
                    <td className="px-4 py-2 border border-gray-600">{formatDate(gestion.fechaAsignacion)}</td>
                    <td className="px-4 py-2 border border-gray-600">{gestion.region}</td>
                    <td className="px-4 py-2 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <span>{gestion.estadoGestion}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetrocederEstado(gestion);
                            }}
                            className="text-gray-400 hover:text-white"
                            disabled={tipoCategoria === "especial" 
                              ? estadosGestionEspecial.indexOf(gestion.estadoGestion) === 0
                              : estadosGestionNormal.indexOf(gestion.estadoGestion) === 0}
                          >
                            ←
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAvanzarEstado(gestion);
                            }}
                            className="text-gray-400 hover:text-white"
                            disabled={tipoCategoria === "especial"
                              ? estadosGestionEspecial.indexOf(gestion.estadoGestion) === estadosGestionEspecial.length - 1
                              : estadosGestionNormal.indexOf(gestion.estadoGestion) === estadosGestionNormal.length - 1}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-600">
                      <div className="h-[75px] overflow-y-hidden" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddObservacionClick(gestion);
                          }}
                          className="text-white-500 hover:text-yellow-300"
                        >
                          {gestion.observaciones === "" || !gestion.observaciones ? "Agregar Observación" : gestion.observaciones}
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
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFacturar(gestion);
                              }}
                              className="text-blue-500 hover:text-green-700"
                            >
                              Facturar
                            </button>
                          )}
                          {gestion.estadoGestion === "Facturado" && isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePagado(gestion);
                              }}
                              className="text-green-500 hover:text-green-700"
                            >
                              Pagado
                            </button>
                          )}
                          {gestion.estadoGestion === "Facturado" && isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerFactura(gestion);
                              }}
                              className="text-white-500 hover:text-gray-300"
                            >
                              Ver Factura
                            </button>
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
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFacturar(gestion);
                              }}
                              className="text-blue-500 hover:text-green-700"
                            >
                              Facturar
                            </button>
                          )}
                        </div>
                      )}
                      {titulo === "Terminados y cobrados" && (
                        <div>
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFacturar(gestion);
                              }}
                              className="text-blue-500 hover:text-green-700"
                            >
                              Facturar
                            </button>
                          )}
                          {gestion.estadoGestion === "Facturado" && isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerFactura(gestion);
                              }}
                              className="text-white-500 hover:text-gray-300"
                            >
                              Ver Factura
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    {(titulo === "Eliminados sin cobrar" || titulo === "Terminados y cobrados") && (
                      <td className="px-4 py-2 border border-gray-600">
                        {(gestion.estadoOC === "Eliminado y cobrado" || gestion.estadoOC === "Eliminado no facturado") && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleEliminarDefinitivo(gestion);
                            }}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isAdmin && (
            <div className="text-white mt-4">
              {titulo === "Gestiones en Trámite" || titulo === "Delayed" ? (
                <div className="text-white mt-4">
                  <table className="min-w-full table-auto border-collapse border border-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border border-gray-600">Total UF Neto</th>
                        <th className="px-4 py-2 border border-gray-600">Total CLP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border border-gray-600">{totalUFNeto}</td>
                        <td className="px-4 py-2 border border-gray-600">{formatCurrency(totalCLPTramites)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border border-gray-600">Órdenes de compra pendientes</td>
                        <td className="px-4 py-2 border border-gray-600">
                          {gestiones.filter(gestion => gestion.numeroOC === "").length}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}

              {titulo === "Terminados sin Facturar y Facturados no Pagados" ? (
                <div>
                  <div className="text-white mt-4">
                    <h3>Terminados</h3>
                    <table className="min-w-full table-auto border-collapse border border-gray-600">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border border-gray-600">Total UF Neto</th>
                          <th className="px-4 py-2 border border-gray-600">Total CLP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border border-gray-600">{totalUFNeto}</td>
                          <td className="px-4 py-2 border border-gray-600">{formatCurrency(totalCLP)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-white mt-4">
                    <h3>Facturados</h3>
                    <table className="min-w-full table-auto border-collapse border border-gray-600">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border border-gray-600">Total UF Neto</th>
                          <th className="px-4 py-2 border border-gray-600">Total CLP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border border-gray-600">{totalUFNetoFacts}</td>
                          <td className="px-4 py-2 border border-gray-600">{formatCurrency(totalCLPFacts)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-white mt-4">
                    <h3></h3>
                    <table className="min-w-full table-auto border-collapse border border-gray-600">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border border-gray-600">Gestiones sin facturar</th>
                          <th className="px-4 py-2 border border-gray-600">Gestiones facturadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border border-gray-600">{totalGestionesSinFacturar}</td>
                          <td className="px-4 py-2 border border-gray-600">{totalGestionesFacturadas}</td>
                        </tr>
                        <tr>
                        <td className="px-4 py-2 border border-gray-600">Órdenes de compra pendientes</td>
                        <td className="px-4 py-2 border border-gray-600">
                          {gestiones.filter(gestion => gestion.numeroOC === "").length}
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {titulo === "Eliminados sin cobrar" && (
                <div className="text-white mt-4">
                  <table className="min-w-full table-auto border-collapse border border-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border border-gray-600">Total UF Neto</th>
                        <th className="px-4 py-2 border border-gray-600">Total CLP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border border-gray-600">{totalUFNeto}</td>
                        <td className="px-4 py-2 border border-gray-600">{formatCurrency(totalCLPEliminados)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <EditGestionModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        gestion={selectedGestion}
        onSave={() => {
          setEditModalOpen(false);
          // Aquí puedes agregar lógica para refrescar la lista si es necesario
        }}
        tipoCategoria={tipoCategoria}
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
      <ViewFacturas isOpen={viewFacturasOpen} onClose={() => setViewFacturasOpen(false)} facturas={facturas} />
    </div>
  );
}