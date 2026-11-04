import { GestorFiltros } from "../src/GestorFiltros";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("GestorFiltros", () => {
  it("debería registrar un filtro y aplicarlo correctamente de forma dinámica", () => {
    const gestor = new GestorFiltros();
    const remitente = new Contacto("Ana", "ana@ucp.edu.ar");
    const correo = new Correo("1", "Examen Final", "Tema importante", remitente, []);

    gestor.registrarFiltro("UCP", (c) => c.remitente.email.includes("ucp.edu.ar"));
    const resultados = gestor.aplicarFiltro("UCP", [correo]);

    expect(resultados.length).toBe(1);
  });
});