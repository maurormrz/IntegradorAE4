import { EnvioGrupal } from "../../src/adicionales/EnvioGrupal";
import { Contacto } from "../../src/Contacto";
import { Correo, DatosCorreo } from "../../src/Correo";
import { GestorCorreos } from "../../src/GestorCorreos";

describe("EnvioGrupal", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis Gómez", "luis@gmail.com");
  const cien = Array.from(
    { length: 100 },
    (_, i) => new Contacto(`Destinatario ${i}`, `usuario${i}@ucp.edu.ar`),
  );
  let gestorAna: GestorCorreos;
  let envio: EnvioGrupal;

  const crearCorreo = (destinatarios: Contacto[], remitente = ana) =>
    new Correo({ asunto: "Aviso general", remitente, destinatarios });

  beforeEach(() => {
    gestorAna = new GestorCorreos();
    envio = new EnvioGrupal();
  });

  describe("envío a 100 destinatarios distintos", () => {
    it("deja el mismo correo en la entrada de cada destinatario", () => {
      const correo = crearCorreo(cien);
      envio.enviar(gestorAna, correo);

      cien.forEach((destinatario) => {
        const entrada = envio.entradaDe(destinatario);
        expect(entrada.cantidad).toBe(1);
        expect(entrada.correos[0]).toBe(correo);
      });
      expect(gestorAna.enviados.correos).toEqual([correo]);
    });

    it("cada destinatario ve solo los correos que le enviaron", () => {
      const primeros = crearCorreo(cien.slice(0, 50));
      const ultimos = crearCorreo(cien.slice(50));
      envio.enviar(gestorAna, primeros);
      envio.enviar(gestorAna, ultimos);

      expect(envio.entradaDe(cien[0]).correos).toEqual([primeros]);
      expect(envio.entradaDe(cien[99]).correos).toEqual([ultimos]);
    });

    it("junta en una entrada los correos de distintos remitentes", () => {
      const deAna = crearCorreo(cien);
      const deLuis = crearCorreo(cien, luis);
      envio.enviar(gestorAna, deAna);
      envio.enviar(new GestorCorreos(), deLuis);

      expect(envio.entradaDe(cien[7]).correos).toEqual([deAna, deLuis]);
    });
  });

  describe("reglas del envío", () => {
    it("no duplica el correo si un destinatario está repetido", () => {
      const mismoEmail = new Contacto("Otro nombre", "USUARIO0@ucp.edu.ar");
      envio.enviar(gestorAna, crearCorreo([cien[0], mismoEmail, cien[0]]));

      expect(envio.entradaDe(mismoEmail)).toBe(envio.entradaDe(cien[0]));
      expect(envio.entradaDe(cien[0]).cantidad).toBe(1);
    });

    it("no duplica nada si se repite la operación de envío", () => {
      const correo = crearCorreo(cien);
      envio.enviar(gestorAna, correo);
      envio.enviar(gestorAna, correo);

      expect(gestorAna.enviados.cantidad).toBe(1);
      expect(envio.entradaDe(cien[0]).cantidad).toBe(1);
    });

    it("envía un borrador válido y lo quita de Borradores", () => {
      const borrador = gestorAna.crearBorrador({
        asunto: "Aviso general",
        remitente: ana,
        destinatarios: cien,
      });
      envio.enviar(gestorAna, borrador);

      expect(gestorAna.borradores.contiene(borrador)).toBe(false);
      expect(envio.entradaDe(cien[99]).contiene(borrador)).toBe(true);
    });

    it.each<[string, DatosCorreo, string]>([
      ["sin asunto", { remitente: ana, destinatarios: cien }, "asunto"],
      ["sin destinatarios", { asunto: "A", remitente: ana }, "destinatario"],
    ])("rechaza un correo %s y no entrega nada", (_caso, datos, faltante) => {
      const correo = new Correo(datos);

      expect(() => envio.enviar(gestorAna, correo)).toThrow(faltante);
      expect(gestorAna.enviados.cantidad).toBe(0);
      expect(envio.entradaDe(cien[0]).cantidad).toBe(0);
    });
  });
});
