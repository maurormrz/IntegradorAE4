import { Bandeja } from "../Bandeja";
import { Contacto } from "../Contacto";
import { Correo } from "../Correo";
import { GestorCorreos } from "../GestorCorreos";

export class EnvioGrupal {
  // La entrada de cada destinatario, identificada por su email
  private readonly entradas = new Map<string, Bandeja>();

  // Devuelve la entrada del contacto y la crea la primera vez que se la pide
  entradaDe(contacto: Contacto): Bandeja {
    let entrada = this.entradas.get(contacto.email);
    if (!entrada) {
      entrada = new Bandeja("Entrada");
      this.entradas.set(contacto.email, entrada);
    }
    return entrada;
  }

  // El emisor guarda el correo en Enviados y cada destinatario lo recibe en su Entrada
  enviar(emisor: GestorCorreos, correo: Correo): void {
    emisor.enviar(correo);
    correo.destinatarios.forEach((destinatario) => {
      const entrada = this.entradaDe(destinatario);
      if (!entrada.contiene(correo)) {
        entrada.agregar(correo);
      }
    });
  }
}
