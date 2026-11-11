import { Contacto } from "../src/Contacto";
import { Correo, DatosCorreo } from "../src/Correo";

describe("Correo", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis Gómez", "luis@gmail.com");
  const marta = new Contacto("Marta Ruiz", "marta@gmail.com");
  const datos: DatosCorreo = {
    asunto: "Examen final",
    cuerpo: "Les recuerdo la fecha",
    remitente: ana,
    destinatarios: [luis, marta],
  };
  const crearCorreo = () => new Correo(datos);

  describe("creación", () => {
    it("mantiene su información y nace no leído y no favorito", () => {
      const correo = crearCorreo();

      expect(correo.asunto).toBe("Examen final");
      expect(correo.cuerpo).toBe("Les recuerdo la fecha");
      expect(correo.remitente).toBe(ana);
      expect(correo.destinatarios).toEqual([luis, marta]);
      expect(correo.leido).toBe(false);
      expect(correo.favorito).toBe(false);
    });

    it("distingue a cada correo, aunque tengan el mismo contenido", () => {
      expect(crearCorreo().id).not.toBe(crearCorreo().id);
    });

    it("permite correos con distintos remitentes y destinatarios", () => {
      const otro = new Correo({ remitente: luis, destinatarios: [ana] });
      expect(otro.remitente).toBe(luis);
      expect(otro.destinatarios).toEqual([ana]);
    });

    it("puede crearse incompleto, como un borrador", () => {
      const borrador = new Correo();

      expect(borrador.asunto).toBe("");
      expect(borrador.remitente).toBeUndefined();
      expect(borrador.destinatarios).toEqual([]);
    });

    it("protege sus destinatarios de cambios hechos desde afuera", () => {
      const lista = [luis, marta];
      const correo = new Correo({ destinatarios: lista });

      lista.push(ana);
      correo.destinatarios.push(ana);

      expect(correo.destinatarios).toEqual([luis, marta]);
    });
  });

  describe("modificación", () => {
    it("editar cambia solo los datos indicados", () => {
      const correo = crearCorreo();
      correo.editar({ asunto: "Recuperatorio", destinatarios: [luis] });

      expect(correo.asunto).toBe("Recuperatorio");
      expect(correo.destinatarios).toEqual([luis]);
      expect(correo.cuerpo).toBe("Les recuerdo la fecha");
      expect(correo.remitente).toBe(ana);
    });

    it("se puede marcar como leído y de nuevo como no leído", () => {
      const correo = crearCorreo();
      correo.marcarComoLeido();
      expect(correo.leido).toBe(true);
      correo.marcarComoNoLeido();
      expect(correo.leido).toBe(false);
    });

    it("se puede marcar y desmarcar como favorito", () => {
      const correo = crearCorreo();
      correo.marcarFavorito();
      expect(correo.favorito).toBe(true);
      correo.desmarcarFavorito();
      expect(correo.favorito).toBe(false);
    });
  });

  describe("validarParaEnvio", () => {
    it("acepta un correo con remitente, asunto y destinatarios", () => {
      expect(() => crearCorreo().validarParaEnvio()).not.toThrow();
    });

    it.each<[string, DatosCorreo, string]>([
      ["sin remitente", { ...datos, remitente: undefined }, "remitente"],
      ["sin asunto", { ...datos, asunto: " " }, "asunto"],
      ["sin destinatarios", { ...datos, destinatarios: [] }, "destinatario"],
    ])("rechaza un correo %s", (_caso, parcial, faltante) => {
      expect(() => new Correo(parcial).validarParaEnvio()).toThrow(faltante);
    });
  });
});