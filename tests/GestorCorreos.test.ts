import { GestorCorreos } from "../src/GestorCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import { Estadisticas } from "../src/Estadisticas";
import { esNoLeido } from "../src/Predicados";

describe("GestorCorreos (cuenta de un usuario)", () => {
  const ana = new Contacto("Ana", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis", "luis@gmail.com");
  // Entregador de prueba: registra a quién se le pidió entregar (no es el servidor real)
  let entregador: { entregar: jest.Mock };
  let cuentaDeAna: GestorCorreos;

  beforeEach(() => {
    entregador = { entregar: jest.fn() };
    cuentaDeAna = new GestorCorreos(ana, entregador);
  });

  const crearBorradorValido = () =>
    cuentaDeAna.crearBorrador({ asunto: "Hola", destinatarios: [luis] });

  describe("Borradores (RF-07)", () => {
    it("crea borradores incompletos a nombre del dueño de la cuenta", () => {
      const borrador = cuentaDeAna.crearBorrador({
        asunto: "Sin destinatario",
      });

      expect(cuentaDeAna.propietario).toBe(ana);
      expect(cuentaDeAna.borradores.contiene(borrador)).toBe(true);
      expect(borrador.remitente).toBe(ana);
    });

    it("edita un borrador mediante el gestor y conserva los cambios", () => {
      const borrador = cuentaDeAna.crearBorrador({ asunto: "Inicial" });

      cuentaDeAna.editarBorrador(borrador, {
        asunto: "Final",
        destinatarios: [luis],
      });

      const guardado = cuentaDeAna.borradores.correos[0];
      expect(guardado.asunto).toBe("Final");
      expect(guardado.destinatarios).toEqual([luis]);
    });

    it("no permite editar un correo que no está en Borradores", () => {
      const borrador = crearBorradorValido();
      cuentaDeAna.enviar(borrador);

      expect(() =>
        cuentaDeAna.editarBorrador(borrador, { asunto: "Otro" }),
      ).toThrow(/Borradores/);
      expect(borrador.asunto).toBe("Hola");
    });
  });

  describe("Envío (RF-02)", () => {
    it("envía un borrador válido: lo entrega y lo pasa a Enviados", () => {
      const borrador = crearBorradorValido();
      cuentaDeAna.enviar(borrador);

      expect(entregador.entregar).toHaveBeenCalledTimes(1);
      expect(entregador.entregar).toHaveBeenCalledWith(borrador);
      expect(cuentaDeAna.borradores.contiene(borrador)).toBe(false);
      expect(cuentaDeAna.enviados.contiene(borrador)).toBe(true);
    });

    it("no envía un borrador inválido y lo deja en Borradores", () => {
      const borrador = cuentaDeAna.crearBorrador({
        asunto: "Sin destinatario",
      });

      expect(() => cuentaDeAna.enviar(borrador)).toThrow(/destinatario/);
      expect(entregador.entregar).not.toHaveBeenCalled();
      expect(cuentaDeAna.borradores.contiene(borrador)).toBe(true);
      expect(cuentaDeAna.enviados.cantidad).toBe(0);
    });

    it("un correo enviado no se puede modificar desde afuera", () => {
      cuentaDeAna.enviar(crearBorradorValido());
      const enviado = cuentaDeAna.enviados.correos[0];

      expect(() => enviado.editar({ asunto: "Cambiado" })).toThrow(
        "Un correo enviado no se puede editar",
      );
      expect(enviado.asunto).toBe("Hola");
    });

    it("si la entrega falla, el borrador no cambia de bandeja", () => {
      entregador.entregar.mockImplementation(() => {
        throw new Error("Sin conexión");
      });
      const borrador = crearBorradorValido();

      expect(() => cuentaDeAna.enviar(borrador)).toThrow("Sin conexión");
      expect(cuentaDeAna.borradores.contiene(borrador)).toBe(true);
      expect(cuentaDeAna.enviados.cantidad).toBe(0);
      cuentaDeAna.editarBorrador(borrador, { asunto: "Sigue editable" });
      expect(borrador.asunto).toBe("Sigue editable");
    });

    it("permite enviar un correo nuevo sin pasar por Borradores", () => {
      const correo = new Correo({
        asunto: "Directo",
        remitente: ana,
        destinatarios: [luis],
      });
      cuentaDeAna.enviar(correo);
      expect(cuentaDeAna.enviados.contiene(correo)).toBe(true);
    });

    it("solo envía correos cuyo remitente es el dueño de la cuenta", () => {
      const ajeno = new Correo({
        asunto: "A",
        remitente: luis,
        destinatarios: [ana],
      });
      const sinRemitente = new Correo({ asunto: "B", destinatarios: [luis] });

      expect(() => cuentaDeAna.enviar(ajeno)).toThrow(/dueño de la cuenta/);
      expect(() => cuentaDeAna.enviar(sinRemitente)).toThrow(/remitente/);
      expect(cuentaDeAna.enviados.cantidad).toBe(0);
    });

    it("no genera registros duplicados si se envía el mismo correo dos veces", () => {
      const borrador = crearBorradorValido();
      cuentaDeAna.enviar(borrador);

      expect(() => cuentaDeAna.enviar(borrador)).toThrow(/Enviados/);
      expect(cuentaDeAna.enviados.cantidad).toBe(1);
      expect(entregador.entregar).toHaveBeenCalledTimes(1);
    });

    it("no permite enviar un correo de Entrada ni de Eliminados", () => {
      const recibido = new Correo({
        asunto: "Recibido",
        remitente: luis,
        destinatarios: [ana],
      });
      cuentaDeAna.recibir(recibido);
      expect(() => cuentaDeAna.enviar(recibido)).toThrow(/Entrada/);

      cuentaDeAna.eliminar(recibido);
      expect(() => cuentaDeAna.enviar(recibido)).toThrow(/Eliminados/);
      expect(cuentaDeAna.enviados.cantidad).toBe(0);
    });
  });

  describe("Bandejas (RF-06)", () => {
    it("recibe correos en la Entrada", () => {
      const correo = new Correo({ asunto: "Bienvenida", remitente: luis });
      cuentaDeAna.recibir(correo);

      expect(cuentaDeAna.entrada.correos).toEqual([correo]);
    });

    it("un correo recibido no se puede modificar", () => {
      const correo = new Correo({ asunto: "Original", remitente: luis });
      cuentaDeAna.recibir(correo);

      expect(() => correo.editar({ asunto: "Cambiado" })).toThrow(
        "Un correo enviado no se puede editar",
      );
    });

    it("expone las bandejas solo para consultar (lo controla TypeScript)", () => {
      const entrada = cuentaDeAna.entrada;
      // @ts-expect-error: una BandejaDeConsulta no tiene agregar; se usa recibir
      entrada.agregar;
      expect(entrada.cantidad).toBe(0);
    });
  });

  describe("Búsqueda (RF-04)", () => {
    it("busca correos en Entrada ignorando mayúsculas", () => {
      const correo = new Correo({
        asunto: "REUNION de equipo",
        remitente: luis,
      });
      cuentaDeAna.recibir(correo);

      expect(cuentaDeAna.buscarEnEntrada("reunion")).toEqual([correo]);
      expect(cuentaDeAna.buscarEnEntrada("inexistente")).toEqual([]);
    });

    it("devuelve una colección vacía si la Entrada está vacía", () => {
      expect(cuentaDeAna.buscarEnEntrada("hola")).toEqual([]);
    });

    it("devuelve el correo una sola vez aunque coincida en varios campos", () => {
      const correo = new Correo({
        asunto: "Ana",
        cuerpo: "Hola Ana",
        remitente: ana,
        destinatarios: [ana],
      });
      cuentaDeAna.recibir(correo);

      expect(cuentaDeAna.buscarEnEntrada("ana")).toEqual([correo]);
    });

    it("no modifica los correos al buscar", () => {
      const correo = new Correo({ asunto: "Examen", remitente: luis });
      cuentaDeAna.recibir(correo);

      cuentaDeAna.buscarEnEntrada("examen");

      expect(correo.asunto).toBe("Examen");
      expect(correo.leido).toBe(false);
      expect(cuentaDeAna.entrada.correos).toEqual([correo]);
    });
  });

  describe("Eliminación y restauración (RF-06)", () => {
    it("elimina un correo de una bandeja activa y lo mueve a Eliminados", () => {
      const correo = new Correo({ asunto: "Para borrar", remitente: luis });
      cuentaDeAna.recibir(correo);

      cuentaDeAna.eliminar(correo);

      expect(cuentaDeAna.entrada.contiene(correo)).toBe(false);
      expect(cuentaDeAna.eliminados.contiene(correo)).toBe(true);
    });

    it("restaura un correo a su bandeja original exacta", () => {
      const enviado = crearBorradorValido();
      cuentaDeAna.enviar(enviado);

      cuentaDeAna.eliminar(enviado);
      expect(cuentaDeAna.eliminados.contiene(enviado)).toBe(true);

      cuentaDeAna.restaurar(enviado);
      expect(cuentaDeAna.enviados.contiene(enviado)).toBe(true);
      expect(cuentaDeAna.eliminados.contiene(enviado)).toBe(false);
    });

    it("no restaura un correo no eliminado ni elimina uno que no está", () => {
      const correo = new Correo({ asunto: "Test" });
      expect(() => cuentaDeAna.restaurar(correo)).toThrow(
        /no está en Eliminados/,
      );
      expect(() => cuentaDeAna.eliminar(correo)).toThrow(
        /no se encuentra en ninguna bandeja activa/,
      );
    });

    it("no elimina dos veces el mismo correo", () => {
      const correo = new Correo({ asunto: "Una vez", remitente: luis });
      cuentaDeAna.recibir(correo);
      cuentaDeAna.eliminar(correo);

      expect(() => cuentaDeAna.eliminar(correo)).toThrow(
        /no se encuentra en ninguna bandeja activa/,
      );
      expect(cuentaDeAna.eliminados.cantidad).toBe(1);
    });
  });

  describe("Lectura (RF-08)", () => {
    it("obtiene los no leídos de una bandeja y refleja los cambios", () => {
      const estadisticas = new Estadisticas();
      const leido = new Correo({ asunto: "Leído", remitente: luis });
      const pendiente = new Correo({ asunto: "Pendiente", remitente: luis });
      cuentaDeAna.recibir(leido);
      cuentaDeAna.recibir(pendiente);

      leido.marcarComoLeido();
      const noLeidos = () =>
        estadisticas.filtrarCorreos(cuentaDeAna.entrada.correos, esNoLeido());
      expect(noLeidos()).toEqual([pendiente]);

      leido.marcarComoNoLeido();
      expect(noLeidos()).toEqual([leido, pendiente]);
    });
  });

  describe("Favoritos (RF-09)", () => {
    it("devuelve favoritos de bandejas activas, excluyendo los eliminados", () => {
      const favorito = new Correo({ asunto: "Favorito", remitente: luis });
      const favEliminado = new Correo({ asunto: "Eliminado", remitente: luis });
      favorito.marcarFavorito();
      favEliminado.marcarFavorito();
      cuentaDeAna.recibir(favorito);
      cuentaDeAna.recibir(favEliminado);
      cuentaDeAna.eliminar(favEliminado);

      expect(cuentaDeAna.obtenerFavoritos()).toEqual([favorito]);
      expect(favEliminado.favorito).toBe(true);
    });
  });
});
