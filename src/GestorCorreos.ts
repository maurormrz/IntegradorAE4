import { Correo } from "./Correo";

export class GestorCorreos {
  private entrada: Correo[] = [];
  private enviados: Correo[] = [];
  private borradores: Correo[] = [];
  private eliminados: Correo[] = [];

  enviarCorreo(correo: Correo): void {
    this.enviados.push(correo);
  }

  guardarBorrador(correo: Correo): void {
    this.borradores.push(correo);
  }

  moverAEliminados(correo: Correo, origen: Correo[]): void {
    const index = origen.findIndex(c => c.id === correo.id);
    if (index !== -1) {
      origen.splice(index, 1);
      this.eliminados.push(correo);
    }
  }

  restaurarCorreo(correo: Correo, destino: Correo[]): void {
    const index = this.eliminados.findIndex(c => c.id === correo.id);
    if (index !== -1) {
      this.eliminados.splice(index, 1);
      destino.push(correo);
    }
  }

  obtenerEnviados(): Correo[] { return this.enviados; }
  obtenerEntrada(): Correo[] { return this.entrada; }
  obtenerBorradores(): Correo[] { return this.borradores; }
  obtenerEliminados(): Correo[] { return this.eliminados; }

  // Obtener correos no leídos de cualquier bandeja
  obtenerNoLeidos(bandeja: Correo[]): Correo[] {
    return bandeja.filter(c => !c.leido);
  }

  // Búsqueda de texto libre (parcial, sin mayúsculas/minúsculas)
  buscarCorreos(texto: string): Correo[] {
    const termino = texto.toLowerCase();
    const todos = [...this.entrada, ...this.enviados];
    
    const resultados = todos.filter(c => 
      c.asunto.toLowerCase().includes(termino) ||
      c.cuerpo.toLowerCase().includes(termino) ||
      c.remitente.nombre.toLowerCase().includes(termino) ||
      c.remitente.email.toLowerCase().includes(termino) ||
      c.destinatarios.some(d => d.nombre.toLowerCase().includes(termino) || d.email.toLowerCase().includes(termino))
    );

    // Evitar que un correo se repita en los resultados si coincide varias veces
    return resultados.filter((c, index, self) => self.findIndex(x => x.id === c.id) === index);
  }
}