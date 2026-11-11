export class Contacto {
  private static readonly FORMATO_EMAIL = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/;

  private readonly _nombreCompleto: string;
  private readonly _email: string;

  constructor(nombreCompleto: string, email: string) {
    const nombre = nombreCompleto.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (nombre === '') {
      throw new Error('El nombre completo es obligatorio');
    }
    if (!Contacto.FORMATO_EMAIL.test(emailNormalizado)) {
      throw new Error('El formato del email no es válido');
    }

    this._nombreCompleto = nombre;
    this._email = emailNormalizado;
  }

  get nombreCompleto(): string {
    return this._nombreCompleto;
  }

  get email(): string {
    return this._email;
  }

  // Dominio del email sin la "@" (por ejemplo, "ucp.edu.ar").
  get dominio(): string {
    return this._email.slice(this._email.indexOf('@') + 1);
  }

  // Dos contactos son el mismo si tienen el mismo email, sin importar el nombre.
  igualA(otro: Contacto): boolean {
    return this._email === otro.email;
  }

  toString(): string {
    return `${this._nombreCompleto} <${this._email}>`;
  }
}