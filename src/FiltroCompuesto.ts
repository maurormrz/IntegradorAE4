import { Correo } from "./Correo";
import { CriterioFiltro } from "./Filtro";

// AND: cumple todos · OR: cumple alguno · NOT: no cumple ninguno
export type OperadorLogico = "AND" | "OR" | "NOT";

// Filtro armado con otros filtros (simples o compuestos). No guarda correos
export class FiltroCompuesto implements CriterioFiltro {
  private readonly filtros: CriterioFiltro[];

  constructor(
    public readonly nombre: string,
    public readonly operador: OperadorLogico,
    filtros: CriterioFiltro[],
  ) {
    if (filtros.length === 0) {
      throw new Error("Un filtro compuesto necesita al menos un filtro");
    }
    this.filtros = [...filtros];
  }

  coincide(correo: Correo): boolean {
    const cumple = (filtro: CriterioFiltro) => filtro.coincide(correo);
    if (this.operador === "AND") {
      return this.filtros.every(cumple);
    }
    if (this.operador === "OR") {
      return this.filtros.some(cumple);
    }
    return !this.filtros.some(cumple);
  }
}
