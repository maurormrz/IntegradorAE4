import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import { Estadisticas } from "../src/Estadisticas";
import {
  Filtro,
  crearFiltroAcademicos,
  crearFiltroPendientes,
  crearFiltroSeguimiento,
  crearFiltroUCP,
} from "../src/Filtro";
import { FiltroCompuesto } from "../src/FiltroCompuesto";
import { GestorFiltros } from "../src/GestorFiltros";
import { asuntoIncluye, esNoLeido, not } from "../src/Predicados";
import { ServidorCorreo } from "../src/ServidorCorreo";

// Historia completa: Enviar -> Eliminar -> Filtros compuestos.
// Los pasos se ejecutan en orden y comparten el mismo servidor y las mismas cuentas.
describe("Escenario: enviar, eliminar y filtrar", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis Gómez", "luis@gmail.com");
  const sofia = new Contacto("Sofía Díaz", "sofia@ucp.edu.ar");
  const marcos = new Contacto("Marcos Ruiz", "marcos@gmail.com");

  // Un servidor y cuatro cuentas: cada persona tiene sus propias bandejas
  const servidor = new ServidorCorreo();
  const cuentaDeAna = servidor.registrar(ana);
  const cuentaDeLuis = servidor.registrar(luis);
  const cuentaDeSofia = servidor.registrar(sofia);
  const cuentaDeMarcos = servidor.registrar(marcos);

  // Herramientas de la historia: gestor de filtros y estadísticas (map, filter, reduce)
  const filtros = new GestorFiltros();
  const estadisticas = new Estadisticas();
  const leidos = new Filtro("Leídos", not(esNoLeido()));
  // Filtro compuesto: académicos de la UCP (AND) que NO estén leídos
  const examenesSinLeer = new FiltroCompuesto("Exámenes UCP sin leer", "AND", [
    crearFiltroAcademicos(),
    new FiltroCompuesto("Sin leer", "NOT", [leidos]),
  ]);

  // Busca en la Entrada de Marcos el correo con ese asunto
  const correoDeMarcos = (asunto: string): Correo =>
    estadisticas.filtrarCorreos(
      cuentaDeMarcos.entrada.correos,
      asuntoIncluye(asunto),
    )[0];

  // Paso 1, ENVIAR: un borrador de Ana llega a la Entrada de los tres
  it("1. Ana envía un correo a Luis, Sofía y Marcos", () => {
    const borrador = cuentaDeAna.crearBorrador({
      asunto: "Entrega del TP",
      cuerpo: "La entrega es el viernes",
      destinatarios: [luis, sofia, marcos],
    });
    cuentaDeAna.enviar(borrador);

    // toString: de quién a quién va
    expect(borrador.toString()).toBe(
      "De: Ana Pérez <ana@ucp.edu.ar> | " +
        "Para: Luis Gómez <luis@gmail.com>, Sofía Díaz <sofia@ucp.edu.ar>, " +
        "Marcos Ruiz <marcos@gmail.com> | Asunto: Entrega del TP",
    );
    expect(cuentaDeAna.enviados.correos).toEqual([borrador]);
    expect(cuentaDeAna.borradores.cantidad).toBe(0);
    [cuentaDeLuis, cuentaDeSofia, cuentaDeMarcos].forEach((cuenta) => {
      expect(cuenta.entrada.cantidad).toBe(1);
      expect(cuenta.entrada.correos[0].toString()).toBe(borrador.toString());
    });
  });

  // Paso 2, ELIMINAR: solo cambia la cuenta de Luis
  it("2. Luis elimina su copia; Sofía y Marcos conservan la suya", () => {
    const copiaDeLuis = cuentaDeLuis.entrada.correos[0];

    cuentaDeLuis.eliminar(copiaDeLuis);

    expect(cuentaDeLuis.entrada.cantidad).toBe(0);
    expect(cuentaDeLuis.eliminados.correos).toEqual([copiaDeLuis]);
    expect(cuentaDeSofia.entrada.cantidad).toBe(1);
    expect(cuentaDeMarcos.entrada.cantidad).toBe(1);
  });

  // Paso 3, RESTAURAR: vuelve a la bandeja de la que salió (Entrada)
  it("3. Luis restaura su copia y vuelve a su Entrada", () => {
    const copiaDeLuis = cuentaDeLuis.eliminados.correos[0];

    cuentaDeLuis.restaurar(copiaDeLuis);

    expect(cuentaDeLuis.entrada.correos).toEqual([copiaDeLuis]);
    expect(cuentaDeLuis.eliminados.cantidad).toBe(0);
  });

  // Paso 4, LEER: el filtro refleja el cambio sin guardar nada de nuevo
  it("4. Sofía lee su copia: solo cambia la suya y el filtro lo refleja", () => {
    const pendientes = crearFiltroPendientes(); // no leído y cuerpo con "Entrega"
    const copiaDeSofia = cuentaDeSofia.entrada.correos[0];
    expect(filtros.aplicar(pendientes, cuentaDeSofia.entrada.correos)).toEqual([
      copiaDeSofia,
    ]);

    copiaDeSofia.marcarComoLeido();

    expect(filtros.aplicar(pendientes, cuentaDeSofia.entrada.correos)).toEqual(
      [],
    );
    expect(cuentaDeMarcos.entrada.correos[0].leido).toBe(false);
  });

  // Paso 5, REGISTRAR FILTROS: el límite es 5; el sexto da error
  it("5. Se registran hasta cinco filtros, simples y compuestos", () => {
    filtros.registrar(crearFiltroUCP());
    filtros.registrar(crearFiltroAcademicos());
    filtros.registrar(crearFiltroPendientes());
    filtros.registrar(crearFiltroSeguimiento());
    filtros.registrar(examenesSinLeer);

    expect(filtros.listar().map((filtro) => filtro.nombre)).toEqual([
      "Correos de la UCP",
      "Correos académicos importantes",
      "Pendientes de revisión",
      "Correos para seguimiento",
      "Exámenes UCP sin leer",
    ]);
    expect(() => filtros.registrar(leidos)).toThrow(/Límite alcanzado/);
  });

  // Paso 6, FILTROS COMPUESTOS sobre 100 correos
  it("6. Marcos recibe 100 correos y el filtro compuesto los clasifica", () => {
    // Ana (UCP) envía los pares y Luis los impares; cada 5 hay un examen
    for (let i = 0; i < 100; i++) {
      const cuenta = i % 2 === 0 ? cuentaDeAna : cuentaDeLuis;
      const asunto = i % 5 === 0 ? `Examen ${i}` : `Consulta ${i}`;
      cuenta.enviar(cuenta.crearBorrador({ asunto, destinatarios: [marcos] }));
    }
    correoDeMarcos("Examen 0").marcarComoLeido();
    correoDeMarcos("Examen 50").marcarComoLeido();

    const entrada = cuentaDeMarcos.entrada.correos;
    // 101 = el correo del paso 1 + los 100 nuevos
    expect(entrada).toHaveLength(101);
    // 51 = los 50 pares de Ana + el correo del paso 1
    expect(filtros.aplicar(crearFiltroUCP(), entrada)).toHaveLength(51);
    // Exámenes de la UCP (0, 10, …, 90) menos los leídos (0 y 50)
    expect(
      estadisticas.obtenerAsuntos(filtros.aplicar(examenesSinLeer, entrada)),
    ).toEqual([
      "Examen 10",
      "Examen 20",
      "Examen 30",
      "Examen 40",
      "Examen 60",
      "Examen 70",
      "Examen 80",
      "Examen 90",
    ]);
  });

  // Paso 7, ELIMINAR + FILTRAR: el mismo filtro sirve para cualquier bandeja
  it("7. Marcos elimina un examen: sale de la Entrada y el filtro lo encuentra en Eliminados", () => {
    const examen10 = correoDeMarcos("Examen 10");

    cuentaDeMarcos.eliminar(examen10);

    const entrada = cuentaDeMarcos.entrada.correos;
    const eliminados = cuentaDeMarcos.eliminados.correos;
    expect(filtros.aplicar(examenesSinLeer, entrada)).toHaveLength(7);
    expect(filtros.aplicar(examenesSinLeer, eliminados)).toEqual([examen10]);
    // reduce: 100 en Entrada menos los 2 leídos = 98
    expect(estadisticas.contarNoLeidos(entrada)).toBe(98);
  });
});
