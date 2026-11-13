import { Contacto } from "./Contacto";

const EMAIL_REPETIDO = "Ya existe un contacto con ese email";
const NO_EXISTE = "El contacto no existe";

export class Agenda {
  private contactos: Contacto[] = [];

  agregar(contacto: Contacto): void {
    if (this.contactos.some((c) => c.igualA(contacto))) {
      throw new Error(EMAIL_REPETIDO);
    }
    this.contactos.push(contacto);
  }

  consultar(email: string): Contacto | undefined {
    const buscado = email.trim().toLowerCase();
    return this.contactos.find((c) => c.email === buscado);
  }

  modificar(email: string, nombre: string, nuevoEmail: string): Contacto {
    const actual = this.obtener(email);
    const nuevo = new Contacto(nombre, nuevoEmail);

    if (this.contactos.some((c) => c !== actual && c.igualA(nuevo))) {
      throw new Error(EMAIL_REPETIDO);
    }
    this.contactos[this.contactos.indexOf(actual)] = nuevo;
    return nuevo;
  }

  eliminar(email: string): void {
    const contacto = this.obtener(email);
    this.contactos.splice(this.contactos.indexOf(contacto), 1);
  }

  listar(): Contacto[] {
    return [...this.contactos];
  }

  private obtener(email: string): Contacto {
    const contacto = this.consultar(email);
    if (!contacto) {
      throw new Error(NO_EXISTE);
    }
    return contacto;
  }
}
