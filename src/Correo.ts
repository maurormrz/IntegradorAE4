import { Contacto } from "./Contacto";

export class Correo {
  public favorito: boolean = false;

  constructor(
    public id: string,
    public asunto: string,
    public cuerpo: string,
    public remitente: Contacto,
    public destinatarios: Contacto[]
  ) {}

  marcarComoFavorito(): void {
    this.favorito = true;
  }
}