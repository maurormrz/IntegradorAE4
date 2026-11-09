// Correos Favoritos
// Demuestra la capacidad de marcar un correo como destacado y filtrarlo dentro de la colección mediante funciones de orden superior.

import { GestorCorreos } from "../../src/GestorCorreos";
import { Correo } from "../../src/Correo";
import { Contacto } from "../../src/Contacto";

describe("GestorCorreos - Funcionalidad de Favoritos", () => {
  it("debería permitir marcar un correo como favorito y filtrarlo correctamente", () => {
    // 1. Preparar datos
    const remitente = new Contacto("Lucía", "lucia@ucp.edu.ar");
    const correoNormal = new Correo("1", "Aviso general", "Texto 1", remitente, []);
    const correoImportante = new Correo("2", "Proyecto final", "Texto 2", remitente, []);

    const gestor = new GestorCorreos();
    gestor.enviarCorreo(correoNormal);
    gestor.enviarCorreo(correoImportante);

    // 2. Ejecutar la nueva funcionalidad marcar uno como favorito
    correoImportante.marcarComoFavorito();

    // 3. Filtrar los favoritos usando la propiedad pública directamente
    const listaFavoritos = gestor.obtenerEnviados().filter(c => c.favorito);

    // 4. Verificaciones
    expect(listaFavoritos.length).toBe(1);
    expect(listaFavoritos[0].id).toBe("2");
    expect(listaFavoritos[0].asunto).toBe("Proyecto final");
  });
});