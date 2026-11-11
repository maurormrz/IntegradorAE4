import { Bandeja } from "./Bandeja";
import { Correo, DatosCorreo } from "./Correo";
import { coincideConTexto } from "./Predicados";

export class GestorCorreos {
  readonly entrada = new Bandeja("Entrada");
  readonly enviados = new Bandeja("Enviados");
  readonly borradores = new Bandeja("Borradores");
  readonly eliminados = new Bandeja("Eliminados");

  // Guarda a qué bandeja pertenecía un correo antes de ser eliminado
  private readonly origenEliminados = new Map<number, Bandeja>();

  // Registrar un borrador
  crearBorrador(datos: DatosCorreo): Correo {
    const borrador = new Correo(datos);
    this.borradores.agregar(borrador);
    return borrador;
  }

  // Enviar correo (valida, mueve de borradores o agrega a enviados)
  enviar(correo: Correo): void {
    correo.validarParaEnvio();
    if (this.borradores.contiene(correo)) {
      this.borradores.moverA(this.enviados, correo);
    } else if (!this.enviados.contiene(correo)) {
      this.enviados.agregar(correo);
    }
  }

  // Búsqueda en la Bandeja de Entrada
  buscarEnEntrada(texto: string): Correo[] {
    return this.entrada.correos.filter(coincideConTexto(texto));
  }

  // Eliminar lógicamente un correo
  eliminar(correo: Correo): void {
    const bandejasActivas = [this.entrada, this.enviados, this.borradores];
    const origen = bandejasActivas.find((b) => b.contiene(correo));

    if (!origen) {
      throw new Error("El correo no se encuentra en ninguna bandeja activa");
    }
    origen.moverA(this.eliminados, correo);
    this.origenEliminados.set(correo.id, origen);
  }

  // Restaurar un correo a su bandeja original
  restaurar(correo: Correo): void {
    const origen = this.origenEliminados.get(correo.id);
    if (!origen || !this.eliminados.contiene(correo)) {
      throw new Error("El correo no está en Eliminados o no tiene origen conocido");
    }
    this.eliminados.moverA(origen, correo);
    this.origenEliminados.delete(correo.id);
  }

  // Consultar favoritos (ignorando los eliminados)
  obtenerFavoritos(): Correo[] {
    const coleccionActiva = [
      ...this.entrada.correos,
      ...this.enviados.correos,
      ...this.borradores.correos,
    ];
    return coleccionActiva.filter((c) => c.favorito);
  }
}