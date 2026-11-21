import { Bandeja, BandejaDeConsulta } from "./Bandeja";
import { Contacto } from "./Contacto";
import { Correo, DatosCorreo } from "./Correo";
import { Eliminados } from "./Eliminados";
import { coincideConTexto, esFavorito } from "./Predicados";

export interface Entregador {
  entregar(correo: Correo): void; // lo único que la cuenta necesita
}

// Cuenta de correo de un usuario: sus cuatro bandejas y sus operaciones
export class GestorCorreos {
  private readonly _entrada = new Bandeja("Entrada");
  private readonly _enviados = new Bandeja("Enviados");
  private readonly _borradores = new Bandeja("Borradores");
  private readonly _eliminados = new Eliminados();

  // Desde afuera solo se consultan; se modifican con las operaciones de abajo
  readonly entrada: BandejaDeConsulta = this._entrada;
  readonly enviados: BandejaDeConsulta = this._enviados;
  readonly borradores: BandejaDeConsulta = this._borradores;
  readonly eliminados: BandejaDeConsulta = this._eliminados;

  constructor(
    readonly propietario: Contacto,
    private readonly entregador: Entregador,
  ) {}

  // El remitente de un borrador es siempre el dueño de la cuenta
  crearBorrador(datos: DatosCorreo): Correo {
    const borrador = new Correo({ ...datos, remitente: this.propietario });
    this._borradores.agregar(borrador);
    return borrador;
  }

  // Los cambios quedan guardados en el mismo borrador (el remitente no cambia)
  editarBorrador(borrador: Correo, cambios: DatosCorreo): void {
    if (!this._borradores.contiene(borrador)) {
      throw new Error("Solo se pueden editar correos de Borradores");
    }
    borrador.editar({ ...cambios, remitente: this.propietario });
  }

  // Solo se envían borradores o correos nuevos, a nombre del dueño
  enviar(correo: Correo): void {
    const origen = this.bandejaDe(correo);
    if (origen && origen !== this._borradores) {
      throw new Error(`No se puede enviar un correo de ${origen.nombre}`);
    }
    if (!correo.remitente?.igualA(this.propietario)) {
      throw new Error("El remitente tiene que ser el dueño de la cuenta");
    }
    correo.validarParaEnvio();
    this.entregador.entregar(correo); // si falla, el correo no se mueve
    correo.marcarComoEnviado();
    origen?.remover(correo); // si era un borrador, sale de Borradores
    this._enviados.agregar(correo);
  }

  // Los correos que llegan quedan en la Entrada, sin duplicarse en la cuenta
  recibir(correo: Correo): void {
    if (this.bandejaDe(correo)) {
      throw new Error("El correo ya está en la cuenta");
    }
    correo.marcarComoEnviado();
    this._entrada.agregar(correo);
  }

  buscarEnEntrada(texto: string): Correo[] {
    return this._entrada.correos.filter(coincideConTexto(texto));
  }

  // Eliminación lógica: el correo pasa a Eliminados recordando su origen
  eliminar(correo: Correo): void {
    const origen = this.bandejasActivas().find((b) => b.contiene(correo));
    if (!origen) {
      throw new Error("El correo no se encuentra en ninguna bandeja activa");
    }
    this._eliminados.recibirDe(origen, correo);
  }

  restaurar(correo: Correo): void {
    this._eliminados.restaurar(correo);
  }

  // Favoritos de las bandejas activas (los eliminados no se muestran)
  obtenerFavoritos(): Correo[] {
    const activos = this.bandejasActivas().flatMap((b) => b.correos);
    return activos.filter(esFavorito());
  }

  private bandejasActivas(): Bandeja[] {
    return [this._entrada, this._enviados, this._borradores];
  }

  private bandejaDe(correo: Correo): Bandeja | undefined {
    const todas = [...this.bandejasActivas(), this._eliminados];
    return todas.find((bandeja) => bandeja.contiene(correo));
  }
}
