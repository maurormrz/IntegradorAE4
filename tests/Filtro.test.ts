import {
  Filtro,
  crearFiltroUCP,
  crearFiltroAcademicos,
  crearFiltroPendientes,
  crearFiltroPersonales,
  crearFiltroSeguimiento,
} from "../src/Filtro";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("Filtro (RF-05)", () => {
  const ana = new Contacto("Ana", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis", "luis@gmail.com");

  const correoUcpExamen = new Correo({
    asunto: "Examen de Base de Datos",
    remitente: ana,
  });
  const correoUcpNormal = new Correo({
    asunto: "Aviso general",
    remitente: ana,
  });
  const correoPersonal = new Correo({ asunto: "Fiesta", remitente: luis });
  correoPersonal.marcarFavorito();

  it("permite crear un filtro básico con nombre y predicado", () => {
    const filtro = new Filtro("Asuntos con Fiesta", (c) =>
      c.asunto.includes("Fiesta"),
    );
    expect(filtro.nombre).toBe("Asuntos con Fiesta");
    expect(filtro.coincide(correoPersonal)).toBe(true);
    expect(filtro.coincide(correoUcpExamen)).toBe(false);
  });

  it("crearFiltroUCP: remitentes de @ucp.edu.ar", () => {
    const filtro = crearFiltroUCP();
    expect(filtro.coincide(correoUcpExamen)).toBe(true);
    expect(filtro.coincide(correoPersonal)).toBe(false);
  });

  it("crearFiltroAcademicos: @ucp.edu.ar Y asunto con 'Examen'", () => {
    const filtro = crearFiltroAcademicos();
    expect(filtro.coincide(correoUcpExamen)).toBe(true);
    expect(filtro.coincide(correoUcpNormal)).toBe(false);
  });

  it("crearFiltroPendientes: no leído Y cuerpo con 'Entrega'", () => {
    const correo = new Correo({ cuerpo: "Recordatorio de Entrega" });
    const filtro = crearFiltroPendientes();

    expect(filtro.coincide(correo)).toBe(true);
    correo.marcarComoLeido(); // Cambiamos el estado
    expect(filtro.coincide(correo)).toBe(false); // Refleja el cambio inmediato
  });

  it("crearFiltroPersonales: favorito Y remitente específico", () => {
    const filtro = crearFiltroPersonales(luis);
    expect(filtro.coincide(correoPersonal)).toBe(true);
    expect(filtro.coincide(correoUcpExamen)).toBe(false);
  });

  it("crearFiltroSeguimiento: 'Proyecto' o 'Reunión' Y no leído", () => {
    const filtro = crearFiltroSeguimiento();
    const proyecto = new Correo({ asunto: "Proyecto" });
    const reunionNoLeida = new Correo({ asunto: "Reunión" });
    const reunionLeida = new Correo({ asunto: "Reunión" });
    reunionLeida.marcarComoLeido();

    expect(filtro.coincide(proyecto)).toBe(true);
    expect(filtro.coincide(reunionNoLeida)).toBe(true);
    expect(filtro.coincide(reunionLeida)).toBe(false);
  });
});
