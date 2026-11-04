import { Contacto } from "./Contacto";

export class Correo {
  public leido: boolean = false;
  public favorito: boolean = false;

  constructor(
    public id: string,
    public asunto: string,
    public cuerpo: string,
    public remitente: Contacto,
    public destinatarios: Contacto[]
  ) {}
}