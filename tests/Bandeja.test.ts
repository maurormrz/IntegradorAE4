import { Bandeja } from "../src/Bandeja";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("Bandeja (RF-06)", () => {
  let entrada: Bandeja;
  let enviados: Bandeja;
  let correo1: Correo;
  let correo2: Correo;

  beforeEach(() => {
    entrada = new Bandeja("Entrada");
    enviados = new Bandeja("Enviados");

    const remitente = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
    const destinatario = new Contacto("Luis Gómez", "luis@ucp.edu.ar");

    correo1 = new Correo({
      asunto: "Asunto 1",
      remitente,
      destinatarios: [destinatario],
    });
    correo2 = new Correo({
      asunto: "Asunto 2",
      remitente,
      destinatarios: [destinatario],
    });
  });

  describe("Gestión interna de la bandeja", () => {
    it("inicia vacía y con el nombre correcto", () => {
      expect(entrada.nombre).toBe("Entrada");
      expect(entrada.correos).toEqual([]);
      expect(entrada.cantidad).toBe(0);
    });

    it("permite agregar múltiples correos", () => {
      entrada.agregar(correo1);
      entrada.agregar(correo2);

      expect(entrada.cantidad).toBe(2);
      expect(entrada.correos).toContain(correo1);
      expect(entrada.correos).toContain(correo2);
    });

    it("no permite agregar el mismo correo dos veces (no duplicados)", () => {
      entrada.agregar(correo1);
      expect(() => entrada.agregar(correo1)).toThrow(
        /ya se encuentra en la bandeja/,
      );
    });

    it("expone los correos de forma segura (copia defensiva)", () => {
      entrada.agregar(correo1);
      const listaExterna = entrada.correos;

      listaExterna.pop(); // Intentamos modificar la lista devuelta

      expect(entrada.cantidad).toBe(1); // La bandeja original no se vio afectada
    });

    it("permite remover un correo existente", () => {
      entrada.agregar(correo1);
      entrada.remover(correo1);
      expect(entrada.cantidad).toBe(0);
      expect(entrada.contiene(correo1)).toBe(false);
    });

    it("lanza un error si se intenta remover un correo que no está", () => {
      expect(() => entrada.remover(correo1)).toThrow(
        /no se encuentra en la bandeja/,
      );
    });
  });

  describe("Movimiento entre bandejas", () => {
    it("mueve un correo correctamente de origen a destino", () => {
      entrada.agregar(correo1);

      entrada.moverA(enviados, correo1);

      expect(entrada.contiene(correo1)).toBe(false);
      expect(enviados.contiene(correo1)).toBe(true);
    });

    it("no permite mover un correo que no está en la bandeja de origen", () => {
      expect(() => entrada.moverA(enviados, correo1)).toThrow(
        /no pertenece a la bandeja/,
      );
    });

    it("no permite mover un correo si ya existe en la bandeja de destino", () => {
      entrada.agregar(correo1);
      enviados.agregar(correo1);

      expect(() => entrada.moverA(enviados, correo1)).toThrow(
        /ya existe en la bandeja de destino/,
      );
      // Verificamos que no se haya borrado de la bandeja de origen por error
      expect(entrada.contiene(correo1)).toBe(true);
    });
  });
});
