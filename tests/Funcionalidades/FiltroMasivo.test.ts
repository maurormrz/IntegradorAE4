// Filtro Masivo
// Evalúa el rendimiento y la precisión del sistema al aplicar un predicado de filtrado sobre un volumen de 100 correos.

import { Correo } from "../../src/Correo";
import { Contacto } from "../../src/Contacto";
import { Predicados } from "../../src/Predicados";

describe("GestorFiltros - Lote masivo de 100 correos", () => {
  it("debería filtrar eficientemente un lote de 100 correos aplicando un predicado", () => {
    const remitente = new Contacto("Admin", "admin@ucp.edu.ar");
    const listaCorreos: Correo[] = [];

    // Generamos 100 correos dinámicamente: 50 de la UCP y 50 externos
    for (let i = 1; i <= 100; i++) {
      const dominio = i <= 50 ? "@ucp.edu.ar" : "@gmail.com";
      const contactoTemp = new Contacto(`Usuario ${i}`, `usuario${i}${dominio}`);
      listaCorreos.push(new Correo(String(i), "Consulta", "Mensaje de prueba", contactoTemp, []));
    }

    // Aplicamos el filtro funcional utilizando el predicado de dominio
    const filtroUcp = Predicados.esDeDominio("@ucp.edu.ar");
    const correosFiltrados = listaCorreos.filter(filtroUcp);

    // Verificamos que el resultado contenga exactamente los 50 correos esperados
    expect(correosFiltrados.length).toBe(50);
  });
});