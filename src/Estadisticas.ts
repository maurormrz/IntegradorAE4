import { Correo } from "./Correo";
import { PredicadoCorreo } from "./Predicados";

export class Estadisticas {
  // Obtener la lista de asuntos mediante map
  obtenerAsuntos(correos: Correo[]): string[] {
    return correos.map((correo) => correo.asunto);
  }

  // Obtener correos que cumplan una condición mediante filter
  filtrarCorreos(correos: Correo[], condicion: PredicadoCorreo): Correo[] {
    return correos.filter((correo) => condicion(correo));
  }
}
