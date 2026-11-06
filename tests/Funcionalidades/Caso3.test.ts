// Filtro Compuesto
// Comprueba la combinación lógica de múltiples predicados funcionales (AND) para filtrar correos que cumplan varias condiciones en simultáneo.

import { Correo } from "../../src/Correo";
import { Contacto } from "../../src/Contacto";
import { Predicados } from "../../src/Predicados";

describe("GestorFiltros - Filtro Compuesto", () => {
  it("debería filtrar correos que cumplan dos condiciones simultáneamente (dominio y palabra clave)", () => {
    const remitente1 = new Contacto("Ana", "ana@ucp.edu.ar");
    const remitente2 = new Contacto("Juan", "juan@gmail.com");

    const correo1 = new Correo("1", "Urgente Parcial", "Texto", remitente1, []);
    const correo2 = new Correo("2", "Consulta General", "Texto", remitente1, []);
    const correo3 = new Correo("3", "Urgente Final", "Texto", remitente2, []);

    const bandeja = [correo1, correo2, correo3];

    // Combinamos dos predicados lógicamente (AND): dominio UCP Y asunto contiene "Urgente"
    const filtroCompuesto = (c: Correo) => 
      Predicados.esDeDominio("@ucp.edu.ar")(c) && 
      Predicados.contieneEnAsunto("Urgente")(c);

    const resultado = bandeja.filter(filtroCompuesto);

    // Solo el correo 1 cumple ambas condiciones
    expect(resultado.length).toBe(1);
    expect(resultado[0].id).toBe("1");
    expect(resultado[0].asunto).toBe("Urgente Parcial");
  });
});