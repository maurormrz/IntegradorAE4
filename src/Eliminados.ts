import { Bandeja } from "./Bandeja";
import { Correo } from "./Correo";

// Bandeja de Eliminados: recuerda de dónde vino cada correo para restaurarlo
export class Eliminados extends Bandeja {
  // id del correo -> bandeja de la que salió
  private readonly origenes = new Map<number, Bandeja>();

  constructor() {
    super("Eliminados");
  }

  // Eliminación lógica: saca el correo de su bandeja y lo guarda acá
  recibirDe(origen: Bandeja, correo: Correo): void {
    origen.moverA(this, correo);
    this.origenes.set(correo.id, origen);
  }

  // Devuelve el correo a la bandeja de la que salió
  restaurar(correo: Correo): void {
    const origen = this.origenes.get(correo.id);
    if (!origen) {
      throw new Error("El correo no está en Eliminados");
    }
    this.moverA(origen, correo);
    this.origenes.delete(correo.id);
  }
}
