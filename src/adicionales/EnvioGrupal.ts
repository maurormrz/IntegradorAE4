import { Agenda } from "../Agenda";
import { Contacto } from "../Contacto";
import { Correo } from "../Correo";
import { GestorCorreos } from "../GestorCorreos";

// Lista de distribución: un mismo aviso para todos sus miembros
export class EnvioGrupal {
  // La Agenda ya impide miembros repetidos por email
  private readonly agenda = new Agenda();

  constructor(readonly nombre: string) {}

  agregarMiembro(contacto: Contacto): void {
    this.agenda.agregar(contacto);
  }

  miembros(): Contacto[] {
    return this.agenda.listar();
  }

  // Arma el borrador en la cuenta del remitente y lo envía a todos los miembros
  enviar(cuenta: GestorCorreos, asunto: string, cuerpo: string): Correo {
    const destinatarios = this.miembros();
    const borrador = cuenta.crearBorrador({ asunto, cuerpo, destinatarios });
    cuenta.enviar(borrador);
    return borrador;
  }
}
