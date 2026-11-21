import { Correo } from "./Correo";
import { CriterioFiltro } from "./Filtro";

export class GestorFiltros {
  // Acepta filtros simples y compuestos: los dos cumplen CriterioFiltro
  private readonly filtros: CriterioFiltro[] = [];
  private static readonly LIMITE_FILTROS = 5;

  registrar(filtro: CriterioFiltro): void {
    if (this.filtros.length >= GestorFiltros.LIMITE_FILTROS) {
      throw new Error(
        `Límite alcanzado: máximo ${GestorFiltros.LIMITE_FILTROS} filtros`,
      );
    }
    this.filtros.push(filtro);
  }

  listar(): CriterioFiltro[] {
    return [...this.filtros];
  }

  // Aplica un filtro sobre cualquier colección de correos
  aplicar(filtro: CriterioFiltro, coleccion: Correo[]): Correo[] {
    // filter() devuelve un NUEVO arreglo, por lo que no modifica la colección original
    return coleccion.filter((correo) => filtro.coincide(correo));
  }
}
