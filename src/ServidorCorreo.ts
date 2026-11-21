import { Contacto } from "./Contacto";
import { Correo } from "./Correo";
import { Entregador, GestorCorreos } from "./GestorCorreos";

// Simula el servidor de correo: conoce las cuentas y entrega los mensajes
export class ServidorCorreo implements Entregador {
  // La cuenta de cada usuario registrado, identificada por su email
  private readonly cuentas = new Map<string, GestorCorreos>();

  registrar(contacto: Contacto): GestorCorreos {
    if (this.cuentas.has(contacto.email)) {
      throw new Error(`${contacto.email} ya está registrado`);
    }
    const cuenta = new GestorCorreos(contacto, this);
    this.cuentas.set(contacto.email, cuenta);
    return cuenta;
  }

  cuentaDe(contacto: Contacto): GestorCorreos {
    const cuenta = this.cuentas.get(contacto.email);
    if (!cuenta) {
      throw new Error(`${contacto.email} no está registrado`);
    }
    return cuenta;
  }

  // Cada destinatario recibe su propia copia, una sola vez aunque esté repetido
  entregar(correo: Correo): void {
    // Primero se buscan todas las cuentas: si falta una, no se entrega nada
    const cuentas = correo.destinatarios.map((d) => this.cuentaDe(d));
    new Set(cuentas).forEach((cuenta) => cuenta.recibir(this.copiar(correo)));
  }

  // Mismo contenido, pero con id y estado (leído, favorito) propios
  private copiar(correo: Correo): Correo {
    return new Correo({
      asunto: correo.asunto,
      cuerpo: correo.cuerpo,
      remitente: correo.remitente,
      destinatarios: correo.destinatarios,
    });
  }
}
