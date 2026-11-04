import { Correo } from "./Correo";

type CondicionFiltro = (correo: Correo) => boolean;

export class GestorFiltros {
  private filtros: Map<string, CondicionFiltro> = new Map();

  registrarFiltro(nombre: string, condicion: CondicionFiltro): void {
    this.filtros.set(nombre, condicion);
  }

  aplicarFiltro(nombre: string, correos: Correo[]): Correo[] {
    const condicion = this.filtros.get(nombre);
    if (!condicion) return [];
    return correos.filter(condicion);
  }
}