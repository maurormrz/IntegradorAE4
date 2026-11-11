import { Correo } from "./Correo";

export class Bandeja {
  private readonly _correos: Correo[] = [];

  constructor(public readonly nombre: string) {}

  // Devuelve una copia para proteger las reglas del dominio
  get correos(): Correo[] {
    return [...this._correos];
  }

  get cantidad(): number {
    return this._correos.length;
  }

  agregar(correo: Correo): void {
    if (this.contiene(correo)) {
      throw new Error(`El correo con ID ${correo.id} ya se encuentra en la bandeja ${this.nombre}`);
    }
    this._correos.push(correo);
  }

  remover(correo: Correo): void {
    const index = this._correos.findIndex((c) => c.id === correo.id);
    if (index === -1) {
      throw new Error(`El correo con ID ${correo.id} no se encuentra en la bandeja ${this.nombre}`);
    }
    this._correos.splice(index, 1);
  }

  contiene(correo: Correo): boolean {
    return this._correos.some((c) => c.id === correo.id);
  }

  // Mueve un correo a otra bandeja validando las reglas de no duplicidad
  moverA(destino: Bandeja, correo: Correo): void {
    if (!this.contiene(correo)) {
      throw new Error(`No se puede mover: el correo no pertenece a la bandeja ${this.nombre}`);
    }
    if (destino.contiene(correo)) {
      throw new Error(`No se puede mover: el correo ya existe en la bandeja de destino ${destino.nombre}`);
    }
    
    this.remover(correo);
    destino.agregar(correo);
  }
}