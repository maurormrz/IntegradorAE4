import { Correo } from "./Correo";
import { Contacto } from "./Contacto";

export type PredicadoCorreo = (correo: Correo) => boolean;

// Operadores lógicos (Funciones de orden superior)
export const and =
  (...predicados: PredicadoCorreo[]): PredicadoCorreo =>
  (correo) =>
    predicados.every((p) => p(correo));

export const or =
  (...predicados: PredicadoCorreo[]): PredicadoCorreo =>
  (correo) =>
    predicados.some((p) => p(correo));

export const not =
  (predicado: PredicadoCorreo): PredicadoCorreo =>
  (correo) =>
    !predicado(correo);

// Predicados simples
export const deDominio =
  (dominio: string): PredicadoCorreo =>
  (correo) =>
    correo.remitente?.dominio === dominio.toLowerCase();

export const asuntoIncluye =
  (texto: string): PredicadoCorreo =>
  (correo) =>
    correo.asunto.toLowerCase().includes(texto.toLowerCase());

export const cuerpoIncluye =
  (texto: string): PredicadoCorreo =>
  (correo) =>
    correo.cuerpo.toLowerCase().includes(texto.toLowerCase());

export const esNoLeido = (): PredicadoCorreo => (correo) => !correo.leido;

export const esFavorito = (): PredicadoCorreo => (correo) => correo.favorito;

export const remitenteEs =
  (contacto: Contacto): PredicadoCorreo =>
  (correo) =>
    correo.remitente?.igualA(contacto) ?? false;

// Predicado complejo para búsqueda
export const coincideConTexto = (texto: string): PredicadoCorreo => {
  const busqueda = texto.toLowerCase();
  return (correo) => {
    // Juntamos todos los campos en una sola lista (usando flatMap para destinatarios)
    const campos = [
      correo.asunto,
      correo.cuerpo,
      correo.remitente?.nombreCompleto ?? "",
      correo.remitente?.email ?? "",
      ...correo.destinatarios.flatMap((d) => [d.nombreCompleto, d.email]),
    ];
    // Si alguno de los campos incluye el texto, devolvemos true
    return campos.some((campo) => campo.toLowerCase().includes(busqueda));
  };
};
