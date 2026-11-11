import { Correo } from "./Correo";
import { Filtro } from "./Filtro";

export class GestorFiltros {
  private readonly filtros: Filtro[] = [];
  private static readonly LIMITE_FILTROS = 5;

  registrar(filtro: Filtro): void {
    if (this.filtros.length >= GestorFiltros.LIMITE_FILTROS) {
      throw new Error(`Límite alcanzado: máximo ${GestorFiltros.LIMITE_FILTROS} filtros`);
    }
    this.filtros.push(filtro);
  }

  listar(): Filtro[] {
    return [...this.filtros];
  }

  // Aplica un filtro sobre cualquier colección de correos
  aplicar(filtro: Filtro, coleccion: Correo[]): Correo[] {
    // filter() devuelve un NUEVO arreglo, por lo que no modifica la colección original
    return coleccion.filter((correo) => filtro.coincide(correo));
  }
}