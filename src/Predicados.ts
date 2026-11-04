import { Correo } from "./Correo";

export class Predicados {
  static esDeDominio(dominio: string) {
    return (correo: Correo): boolean => {
      return correo.remitente.email.endsWith(dominio);
    };
  }
}