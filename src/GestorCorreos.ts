import { Correo } from "./Correo";

export class GestorCorreos {
  private enviados: Correo[] = [];

  enviarCorreo(correo: Correo): void {
    this.enviados.push(correo);
  }

  obtenerEnviados(): Correo[] {
    return this.enviados;
  }
}