import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("Correo", () => {
  it("debería crear un correo con estado no leído y no favorito por defecto", () => {
    const remitente = new Contacto("Profe", "profe@ucp.edu.ar");
    const destinatario = new Contacto("Alumno", "alumno@ucp.edu.ar");
    const correo = new Correo("1", "Examen", "Estudiar programación", remitente, [destinatario]);

    expect(correo.id).toBe("1");
    expect(correo.asunto).toBe("Examen");
    expect(correo.leido).toBe(false);
    expect(correo.favorito).toBe(false);
  });
});