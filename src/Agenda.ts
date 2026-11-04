import { Contacto } from "./Contacto";

export class Agenda {
  private contactos: Contacto[] = [];

  agregarContacto(contacto: Contacto): void {
    const existe = this.contactos.some((c) => c.email === contacto.email);
    if (!existe) {
      this.contactos.push(contacto);
    }
  }

  consultarContactos(): Contacto[] {
    return this.contactos;
  }
}