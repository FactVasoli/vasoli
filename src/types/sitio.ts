export interface Sitio {
    id?: string;
    codigoSitio?: string;
    nombreSitio: string;
    region: string;
    contacto?: string;
    expediente?: string;
    baja?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export const REGIONES_CHILE = [
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