import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import {
  and,
  or,
  not,
  deDominio,
  asuntoIncluye,
  cuerpoIncluye,
  esNoLeido,
  esFavorito,
  remitenteEs,
  coincideConTexto,
} from "../src/Predicados";

describe("Predicados (RF-05)", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis Gómez", "luis@gmail.com");

  const correoUcp = new Correo({
    asunto: "Examen de Programación",
    cuerpo: "La entrega es el viernes",
    remitente: ana,
    destinatarios: [luis],
  });

  const correoPersonal = new Correo({
    asunto: "Reunión familiar",
    cuerpo: "Nos vemos el domingo",
    remitente: luis,
    destinatarios: [ana],
  });
  correoPersonal.marcarComoLeido();
  correoPersonal.marcarFavorito();

  // Correo vacío para probar los casos sin remitente (cobertura de ramas)
  const correoSinRemitente = new Correo({ asunto: "Solo borrador" });

  describe("Operadores lógicos", () => {
    it("and: ambas condiciones deben cumplirse", () => {
      const filtro = and(deDominio("ucp.edu.ar"), asuntoIncluye("Examen"));
      expect(filtro(correoUcp)).toBe(true);
      expect(filtro(correoPersonal)).toBe(false);
    });

    it("or: al menos una condición debe cumplirse", () => {
      const filtro = or(deDominio("ucp.edu.ar"), esFavorito());
      expect(filtro(correoUcp)).toBe(true);
      expect(filtro(correoPersonal)).toBe(true);
    });

    it("not: invierte el resultado", () => {
      const filtro = not(esNoLeido());
      expect(filtro(correoUcp)).toBe(false);
      expect(filtro(correoPersonal)).toBe(true);
    });
  });

  describe("Predicados simples", () => {
    it("deDominio: verifica el dominio del remitente", () => {
      expect(deDominio("ucp.edu.ar")(correoUcp)).toBe(true);
      expect(deDominio("ucp.edu.ar")(correoSinRemitente)).toBe(false); // Cubre rama undefined
    });

    it("asuntoIncluye y cuerpoIncluye: sin distinguir mayúsculas", () => {
      expect(asuntoIncluye("examen")(correoUcp)).toBe(true);
      expect(cuerpoIncluye("VIERNES")(correoUcp)).toBe(true);
    });

    it("remitenteEs: verifica si un contacto es el remitente", () => {
      expect(remitenteEs(ana)(correoUcp)).toBe(true);
      expect(remitenteEs(ana)(correoSinRemitente)).toBe(false); // Cubre rama ?? false
    });
  });

  describe("coincideConTexto (RF-04)", () => {
    it("encuentra coincidencias en asunto, cuerpo, remitente o destinatarios", () => {
      expect(coincideConTexto("programación")(correoUcp)).toBe(true); // Asunto
      expect(coincideConTexto("domingo")(correoPersonal)).toBe(true); // Cuerpo
      expect(coincideConTexto("Luis")(correoPersonal)).toBe(true); // Remitente (nombre)
      expect(coincideConTexto("ucp")(correoUcp)).toBe(true); // Remitente (email) y Destinatario
    });

    it("devuelve false si no hay coincidencias o faltan datos", () => {
      expect(coincideConTexto("ausente")(correoUcp)).toBe(false);
      expect(coincideConTexto("ausente")(correoSinRemitente)).toBe(false); // Cubre rama sin remitente
    });
  });
});
