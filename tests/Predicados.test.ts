import { Predicados } from "../src/Predicados";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("Predicados", () => {
  it("debería evaluar si un correo pertenece al dominio de la UCP", () => {
    const remitente = new Contacto("Juan", "juan@ucp.edu.ar");
    const correo = new Correo("1", "Consulta", "Duda de clases", remitente, []);

    const filtroUcp = Predicados.esDeDominio("@ucp.edu.ar");

    expect(filtroUcp(correo)).toBe(true);
  });
});