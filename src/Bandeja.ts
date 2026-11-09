import { Correo } from "./Correo";

export class Bandeja {
  constructor(public nombre: string, private correos: Correo[] = []) {}

  agregarCorreo(correo: Correo): void {
    if (!this.correos.some(c => c.id === correo.id)) {
      this.correos.push(correo);
    }
  }

  obtenerCorreos(): Correo[] {
    return this.correos;
  }
}