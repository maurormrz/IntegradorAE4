import { Contacto } from "./Contacto";

export interface DatosCorreo {
  asunto?: string;
  cuerpo?: string;
  remitente?: Contacto;
  destinatarios?: Contacto[];
}

export class Correo {
  private static contador = 0;

  readonly id: number;
  private _asunto = "";
  private _cuerpo = "";
  private _remitente?: Contacto;
  private _destinatarios: Contacto[] = [];
  private _leido = false;
  private _favorito = false;

  constructor(datos: DatosCorreo = {}) {
    this.id = ++Correo.contador;
    this.editar(datos);
  }

  editar(cambios: DatosCorreo): void {
    this._asunto = cambios.asunto ?? this._asunto;
    this._cuerpo = cambios.cuerpo ?? this._cuerpo;
    this._remitente = cambios.remitente ?? this._remitente;
    this._destinatarios = [...(cambios.destinatarios ?? this._destinatarios)];
  }

  get asunto(): string {
    return this._asunto;
  }

  get cuerpo(): string {
    return this._cuerpo;
  }

  get remitente(): Contacto | undefined {
    return this._remitente;
  }

  // Devuelve una copia para que nadie modifique la lista interna
  get destinatarios(): Contacto[] {
    return [...this._destinatarios];
  }

  get leido(): boolean {
    return this._leido;
  }

  get favorito(): boolean {
    return this._favorito;
  }

  marcarComoLeido(): void {
    this._leido = true;
  }

  marcarComoNoLeido(): void {
    this._leido = false;
  }

  marcarFavorito(): void {
    this._favorito = true;
  }

  desmarcarFavorito(): void {
    this._favorito = false;
  }

  // Los borradores pueden estar incompletos, pero para enviarlos esto debe cumplirse
  validarParaEnvio(): void {
    if (!this._remitente) {
      throw new Error("El correo necesita un remitente");
    }
    if (this._asunto.trim() === "") {
      throw new Error("El correo necesita un asunto");
    }
    if (this._destinatarios.length === 0) {
      throw new Error("El correo necesita al menos un destinatario");
    }
  }
}