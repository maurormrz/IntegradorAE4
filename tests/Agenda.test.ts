import { Agenda } from "../src/Agenda";
import { Contacto } from "../src/Contacto";

describe("Agenda", () => {
  let agenda: Agenda;
  let ana: Contacto;
  let luis: Contacto;

  beforeEach(() => {
    agenda = new Agenda();
    ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
    luis = new Contacto("Luis Gómez", "luis@gmail.com");
  });

  describe("agregar", () => {
    it("agrega nuevos contactos", () => {
      agenda.agregar(ana);
      agenda.agregar(luis);

      expect(agenda.listar()).toEqual([ana, luis]);
    });

    it("rechaza un email que ya existe, sin importar mayúsculas", () => {
      agenda.agregar(ana);

      expect(() =>
        agenda.agregar(new Contacto("Otra Ana", "ANA@ucp.edu.ar")),
      ).toThrow("Ya existe un contacto con ese email");
      expect(agenda.listar()).toHaveLength(1);
    });
  });

  describe("consultar", () => {
    it("busca por email, sin importar mayúsculas ni espacios", () => {
      agenda.agregar(ana);

      expect(agenda.consultar(" ANA@ucp.edu.ar ")).toBe(ana);
    });

    it("devuelve undefined si el contacto no existe", () => {
      expect(agenda.consultar("nadie@ucp.edu.ar")).toBeUndefined();
    });
  });

  describe("modificar", () => {
    it("reemplaza el contacto sin alterar el objeto original", () => {
      agenda.agregar(ana);

      const nueva = agenda.modificar(
        "ana@ucp.edu.ar",
        "Ana María Pérez",
        "anamaria@ucp.edu.ar",
      );

      expect(agenda.listar()).toEqual([nueva]);
      expect(agenda.consultar("ana@ucp.edu.ar")).toBeUndefined();
      expect(ana.nombreCompleto).toBe("Ana Pérez");
    });

    it("permite cambiar solo el nombre y conservar el email", () => {
      agenda.agregar(ana);
      const nueva = agenda.modificar("ana@ucp.edu.ar", "Ana M.", ana.email);

      expect(agenda.consultar("ana@ucp.edu.ar")).toBe(nueva);
    });

    it("rechaza usar el email de otro contacto", () => {
      agenda.agregar(ana);
      agenda.agregar(luis);
      expect(() =>
        agenda.modificar("ana@ucp.edu.ar", "Ana Pérez", "luis@gmail.com"),
      ).toThrow("Ya existe un contacto con ese email");
    });

    it("rechaza modificar un contacto que no existe", () => {
      expect(() =>
        agenda.modificar("nadie@ucp.edu.ar", "Nadie", "nadie@ucp.edu.ar"),
      ).toThrow("El contacto no existe");
    });
  });

  describe("eliminar", () => {
    it("quita el contacto de la agenda y el objeto conserva sus datos", () => {
      agenda.agregar(ana);
      agenda.agregar(luis);

      agenda.eliminar("ana@ucp.edu.ar");

      expect(agenda.listar()).toEqual([luis]);
      expect(ana.toString()).toBe("Ana Pérez <ana@ucp.edu.ar>");
    });

    it("rechaza eliminar un contacto que no existe", () => {
      expect(() => agenda.eliminar("nadie@ucp.edu.ar")).toThrow(
        "El contacto no existe",
      );
    });
  });
});
