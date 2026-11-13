import { Correo } from "./Correo";
import { Contacto } from "./Contacto";
import {
  PredicadoCorreo,
  and,
  or,
  deDominio,
  asuntoIncluye,
  cuerpoIncluye,
  esNoLeido,
  esFavorito,
  remitenteEs,
} from "./Predicados";

export class Filtro {
  constructor(
    public readonly nombre: string,
    public readonly predicado: PredicadoCorreo,
  ) {}

  // Evalúa si un correo cumple con la condición del filtro
  coincide(correo: Correo): boolean {
    return this.predicado(correo);
  }
}

// Fábricas de los filtros de ejemplo ---

export const crearFiltroUCP = (): Filtro =>
  new Filtro("Correos de la UCP", deDominio("ucp.edu.ar"));

export const crearFiltroAcademicos = (): Filtro =>
  new Filtro(
    "Correos académicos importantes",
    and(deDominio("ucp.edu.ar"), asuntoIncluye("Examen")),
  );

export const crearFiltroPendientes = (): Filtro =>
  new Filtro(
    "Pendientes de revisión",
    and(esNoLeido(), cuerpoIncluye("Entrega")),
  );

export const crearFiltroPersonales = (contacto: Contacto): Filtro =>
  new Filtro(
    "Correos personales prioritarios",
    and(esFavorito(), remitenteEs(contacto)),
  );

export const crearFiltroSeguimiento = (): Filtro =>
  new Filtro(
    "Correos para seguimiento",
    and(or(asuntoIncluye("Proyecto"), asuntoIncluye("Reunión")), esNoLeido()),
  );
