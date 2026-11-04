import { Correo } from "./Correo";

export class Estadisticas {
  static obtenerAsuntos(correos: Correo[]): string[] {
    return correos.map((correo) => correo.asunto);
  }
}