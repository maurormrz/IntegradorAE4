import { GestorCorreos } from "../src/GestorCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("GestorCorreos (Integrador)", () => {
  let gestor: GestorCorreos;
  let ana: Contacto;
  let luis: Contacto;

  beforeEach(() => {
    gestor = new GestorCorreos();
    ana = new Contacto("Ana", "ana@ucp.edu.ar");
    luis = new Contacto("Luis", "luis@gmail.com");
  });

  describe("Borradores y Envío (RF-02, RF-07)", () => {
    it("crea borradores incompletos", () => {
      const borrador = gestor.crearBorrador({ asunto: "Sin destinatario" });
      expect(gestor.borradores.contiene(borrador)).toBe(true);
    });

    it("envía un borrador válido y lo quita de la bandeja de borradores", () => {
      const borrador = gestor.crearBorrador({ asunto: "Hola", remitente: ana, destinatarios: [luis] });
      gestor.enviar(borrador);

      expect(gestor.borradores.contiene(borrador)).toBe(false);
      expect(gestor.enviados.contiene(borrador)).toBe(true);
    });

    it("no permite enviar un borrador inválido", () => {
      const borradorInvalido = gestor.crearBorrador({ asunto: "Falta remitente" });
      expect(() => gestor.enviar(borradorInvalido)).toThrow(/remitente/);
    });

    it("permite enviar un correo directo sin pasar por borradores", () => {
      const correo = new Correo({ asunto: "Directo", remitente: ana, destinatarios: [luis] });
      gestor.enviar(correo);
      expect(gestor.enviados.contiene(correo)).toBe(true);
    });

    it("evita generar registros duplicados si se envía el mismo correo dos veces", () => {
      const correo = new Correo({ asunto: "Duplicado", remitente: ana, destinatarios: [luis] });
      
      gestor.enviar(correo);
      gestor.enviar(correo);
      
      expect(gestor.enviados.cantidad).toBe(1); // Solo debe haber 1 correo en Enviados
    });
  });

  describe("Búsqueda (RF-04)", () => {
    it("busca correos en Entrada ignorando mayúsculas", () => {
      const correo = new Correo({ asunto: "REUNION de equipo", remitente: ana });
      gestor.entrada.agregar(correo);

      expect(gestor.buscarEnEntrada("reunion")).toContain(correo);
      expect(gestor.buscarEnEntrada("inexistente")).toEqual([]);
    });
  });

  describe("Eliminación y Restauración (RF-06)", () => {
    it("elimina un correo de una bandeja activa y lo mueve a Eliminados", () => {
      const correo = new Correo({ asunto: "Para borrar", remitente: ana });
      gestor.entrada.agregar(correo);

      gestor.eliminar(correo);
      
      expect(gestor.entrada.contiene(correo)).toBe(false);
      expect(gestor.eliminados.contiene(correo)).toBe(true);
    });

    it("restaura un correo a su bandeja original exacta", () => {
      const correoEnviado = new Correo({ asunto: "Enviado", remitente: ana, destinatarios: [luis] });
      gestor.enviar(correoEnviado); 

      gestor.eliminar(correoEnviado);
      expect(gestor.eliminados.contiene(correoEnviado)).toBe(true);

      gestor.restaurar(correoEnviado);
      expect(gestor.enviados.contiene(correoEnviado)).toBe(true); 
      expect(gestor.eliminados.contiene(correoEnviado)).toBe(false);
    });

    it("lanza error si intenta restaurar un correo no eliminado o eliminar uno inexistente", () => {
      const correo = new Correo({ asunto: "Test" });
      expect(() => gestor.restaurar(correo)).toThrow(/no está en Eliminados/);
      expect(() => gestor.eliminar(correo)).toThrow(/no se encuentra en ninguna bandeja activa/);
    });
  });

  describe("Favoritos (RF-09)", () => {
    it("devuelve favoritos de bandejas activas, excluyendo los eliminados", () => {
      const fav1 = new Correo({ asunto: "Fav1", remitente: ana });
      fav1.marcarFavorito();
      gestor.entrada.agregar(fav1);

      const favEliminado = new Correo({ asunto: "FavEliminado", remitente: ana });
      favEliminado.marcarFavorito();
      gestor.entrada.agregar(favEliminado);
      gestor.eliminar(favEliminado); 

      const favoritos = gestor.obtenerFavoritos();
      
      expect(favoritos).toContain(fav1);
      expect(favoritos).not.toContain(favEliminado); 
      expect(favoritos.length).toBe(1);
    });
  });
});