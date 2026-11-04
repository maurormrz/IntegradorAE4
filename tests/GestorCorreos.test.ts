import { GestorCorreos } from "../src/GestorCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("GestorCorreos", () => {
  it("debería enviar un correo y ubicarlo en la bandeja de enviados", () => {
    const gestor = new GestorCorreos();
    const remitente = new Contacto("Yo", "yo@ucp.edu.ar");
    const destino = new Contacto("Amigo", "amigo@ucp.edu.ar");
    const correo = new Correo("1", "Hola", "¿Cómo estás?", remitente, [destino]);

    gestor.enviarCorreo(correo);

    expect(gestor.obtenerEnviados().length).toBe(1);
  });
});