import { Correo } from "./Correo";

export class Predicados {
  static esDeDominio(dominio: string) {
    return (correo: Correo): boolean => {
      return correo.remitente.email.endsWith(dominio);
    };
  }

  static contieneEnAsunto(texto: string) {
    return (correo: Correo): boolean => {
      return correo.asunto.toLowerCase().includes(texto.toLowerCase());
    };
  }
}