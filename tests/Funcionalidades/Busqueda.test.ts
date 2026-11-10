import { GestorCorreos } from "../../src/GestorCorreos";
import { Correo } from "../../src/Correo";
import { Contacto } from "../../src/Contacto";

describe("GestorCorreos - Bandejas, Lectura y Búsqueda", () => {
  it("debería cubrir la gestión de borradores, eliminados, estado de lectura y búsqueda", () => {
    const remitente = new Contacto("Ana", "ana@ucp.edu.ar");
    const destinatario = new Contacto("Juan", "juan@ucp.edu.ar");
    const correo = new Correo("1", "Parcial de Paradigmas", "Estudiar POO y Funcional", remitente, [destinatario]);

    // 1. Probar marcado de lectura 
    correo.marcarComoLeido();
    expect(correo.leido).toBe(true);
    correo.marcarComoNoLeido();
    expect(correo.leido).toBe(false);

    const gestor = new GestorCorreos();

    // 2. Probar Borradores
    gestor.guardarBorrador(correo);
    expect(gestor.obtenerBorradores().length).toBe(1);

    // 3. Probar Mover a Eliminados y Restaurar 
    gestor.moverAEliminados(correo, gestor.obtenerBorradores());
    expect(gestor.obtenerEliminados().length).toBe(1);

    gestor.restaurarCorreo(correo, gestor.obtenerEntrada());
    expect(gestor.obtenerEliminados().length).toBe(0);
    expect(gestor.obtenerEntrada().length).toBe(1);

    // 4. Probar Obtener No Leídos
    const noLeidos = gestor.obtenerNoLeidos(gestor.obtenerEntrada());
    expect(noLeidos.length).toBe(1);

    // 5. Probar Búsqueda de texto libre
    const resultados = gestor.buscarCorreos("Paradigmas");
    expect(resultados.length).toBe(1);
    expect(resultados[0].id).toBe("1");
  });
});