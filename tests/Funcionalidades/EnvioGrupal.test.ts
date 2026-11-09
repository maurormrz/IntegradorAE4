// Envío Grupal
// Verifica que un único correo enviado a múltiples destinatarios sea accesible y visible en la bandeja de entrada de cada uno de ellos.

import { GestorCorreos } from "../../src/GestorCorreos";
import { Correo } from "../../src/Correo";
import { Contacto } from "../../src/Contacto";

describe("GestorCorreos - Envío a múltiples destinatarios", () => {
  it("debería enviar un mismo correo a 3 personas y permitir que cada una lo visualice en sus recibidos", () => {
    // 1. Crear el remitente y los 3 destinatarios
    const remitente = new Contacto("Carlos", "carlos@ucp.edu.ar");
    const dest1 = new Contacto("Ana", "ana@ucp.edu.ar");
    const dest2 = new Contacto("Bruno", "bruno@ucp.edu.ar");
    const dest3 = new Contacto("Diana", "diana@ucp.edu.ar");

    const listaDestinatarios = [dest1, dest2, dest3];

    // 2. Crear el correo dirigido a las 3 personas
    const correoGrupal = new Correo(
      "101",
      "Reunión de Proyecto",
      "Hola a todos, nos vemos en la reunión.",
      remitente,
      listaDestinatarios
    );

    const gestor = new GestorCorreos();

    // 3. Enviar el correo a través del gestor
    gestor.enviarCorreo(correoGrupal);

    // 4. Verificar que el correo enviado esté registrado en el gestor
    const enviados = gestor.obtenerEnviados();
    expect(enviados).toContain(correoGrupal);

    // 5. Verificar que cada una de las 3 personas figura como destinataria del correo
    listaDestinatarios.forEach((destinatario) => {
      const correosDelDestinatario = enviados.filter((c) =>
        c.destinatarios.some((d) => d.email === destinatario.email)
      );

      // Comprobar que el correo llegó a este destinatario
      expect(correosDelDestinatario).toContain(correoGrupal);
      expect(correosDelDestinatario[0].asunto).toBe("Reunión de Proyecto");
    });
  });
});