import { Estadisticas } from "../src/Estadisticas";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("Estadisticas", () => {
  it("debería obtener la lista de asuntos de una bandeja usando map", () => {
    const remitente = new Contacto("Juan", "juan@ucp.edu.ar");
    const c1 = new Correo("1", "Asunto 1", "Cuerpo", remitente, []);
    const c2 = new Correo("2", "Asunto 2", "Cuerpo", remitente, []);

    const asuntos = Estadisticas.obtenerAsuntos([c1, c2]);

    expect(asuntos).toEqual(["Asunto 1", "Asunto 2"]);
  });
});