import { Correo } from "../Correo";
import { Estadisticas } from "../Estadisticas";
import { GestorCorreos } from "../GestorCorreos";
import { PredicadoCorreo } from "../Predicados";

export class Favoritos {
  private readonly estadisticas = new Estadisticas();

  constructor(private readonly gestor: GestorCorreos) {}

  marcar(correo: Correo): void {
    correo.marcarFavorito();
  }

  desmarcar(correo: Correo): void {
    correo.desmarcarFavorito();
  }

  // Favoritos de las bandejas activas, sin importar en cuál estén
  listar(): Correo[] {
    return this.gestor.obtenerFavoritos();
  }

  // Filtra solo dentro de los favoritos. La condición puede combinarse con and, or y not
  filtrar(condicion: PredicadoCorreo): Correo[] {
    return this.estadisticas.filtrarCorreos(this.listar(), condicion);
  }
}