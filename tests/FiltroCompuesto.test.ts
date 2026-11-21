import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import { Estadisticas } from "../src/Estadisticas";
import { Filtro, crearFiltroAcademicos, crearFiltroUCP } from "../src/Filtro";
import { FiltroCompuesto } from "../src/FiltroCompuesto";
import { GestorFiltros } from "../src/GestorFiltros";
import { asuntoIncluye, esFavorito, esNoLeido, not } from "../src/Predicados";

// FiltroCompuesto combina filtros (simples o compuestos) con AND, OR o NOT.
// Cumple CriterioFiltro, así que se usa igual que un Filtro (polimorfismo).
describe("FiltroCompuesto (RF-05)", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis Gómez", "luis@gmail.com");
  // Filtros simples reutilizables, armados con los predicados que ya existen
  const leidos = new Filtro("Leídos", not(esNoLeido()));
  const favoritos = new Filtro("Favoritos", esFavorito());

  // Correos de ejemplo: UCP sin leer, personal leído y personal sin leer
  const examenUcp = new Correo({ asunto: "Examen final", remitente: ana });
  const fiestaLeida = new Correo({ asunto: "Fiesta", remitente: luis });
  const avisoSinLeer = new Correo({ asunto: "Aviso", remitente: luis });
  fiestaLeida.marcarComoLeido();

  describe("operadores lógicos", () => {
    // AND: como "every", tienen que cumplirse todos
    it("AND: el correo tiene que cumplir todos los filtros", () => {
      const filtro = new FiltroCompuesto("UCP y examen", "AND", [
        crearFiltroUCP(),
        crearFiltroAcademicos(),
      ]);
      expect(filtro.coincide(examenUcp)).toBe(true);
      expect(filtro.coincide(fiestaLeida)).toBe(false);
    });

    // OR: como "some", alcanza con que se cumpla uno
    it("OR: alcanza con que cumpla uno de los filtros", () => {
      const filtro = new FiltroCompuesto("UCP o leídos", "OR", [
        crearFiltroUCP(),
        leidos,
      ]);
      expect(filtro.coincide(examenUcp)).toBe(true);
      expect(filtro.coincide(fiestaLeida)).toBe(true);
      expect(filtro.coincide(avisoSinLeer)).toBe(false);
    });

    // NOT: no tiene que cumplirse ninguno (lo contrario de OR)
    it("NOT: el correo no tiene que cumplir ninguno de los filtros", () => {
      const filtro = new FiltroCompuesto("Ni UCP ni leídos", "NOT", [
        crearFiltroUCP(),
        leidos,
      ]);
      expect(filtro.coincide(examenUcp)).toBe(false);
      expect(filtro.coincide(fiestaLeida)).toBe(false);
      expect(filtro.coincide(avisoSinLeer)).toBe(true);
    });
  });

  describe("construcción", () => {
    // Composición: un compuesto puede tener otros compuestos adentro
    it("puede contener otros filtros compuestos", () => {
      const noFavoritos = new FiltroCompuesto("No favoritos", "NOT", [
        favoritos,
      ]);
      const filtro = new FiltroCompuesto("UCP no favoritos", "AND", [
        crearFiltroUCP(),
        noFavoritos,
      ]);
      expect(filtro.coincide(examenUcp)).toBe(true);
      examenUcp.marcarFavorito();
      expect(filtro.coincide(examenUcp)).toBe(false);
      // Se deja como estaba para no afectar a los otros tests
      examenUcp.desmarcarFavorito();
    });

    // Nombre y operador se pueden consultar (son de solo lectura)
    it("guarda su nombre y su operador", () => {
      const filtro = new FiltroCompuesto("Leídos", "OR", [leidos]);
      expect(filtro.nombre).toBe("Leídos");
      expect(filtro.operador).toBe("OR");
    });

    // Validación: un compuesto sin filtros no tiene sentido
    it("rechaza una lista de filtros vacía", () => {
      expect(() => new FiltroCompuesto("Vacío", "AND", [])).toThrow(
        "Un filtro compuesto necesita al menos un filtro",
      );
    });

    // Copia defensiva: cambiar la lista de afuera no cambia el filtro
    it("no cambia si después se modifica la lista original", () => {
      const lista = [crearFiltroUCP()];
      const filtro = new FiltroCompuesto("UCP", "AND", lista);
      lista.push(new Filtro("Ninguno", () => false));
      expect(filtro.coincide(examenUcp)).toBe(true);
    });
  });

  // Corrección del profesor: un FiltroCompuesto que filtre 100 correos
  describe("sobre 100 correos", () => {
    const gestor = new GestorFiltros();
    const estadisticas = new Estadisticas();
    let cien: Correo[];

    // Exámenes de la UCP que todavía no fueron leídos
    const filtro = new FiltroCompuesto("Exámenes UCP sin leer", "AND", [
      crearFiltroUCP(),
      new Filtro("Asunto con Examen", asuntoIncluye("Examen")),
      new FiltroCompuesto("Sin leer", "NOT", [leidos]),
    ]);

    // Pares: de la UCP. Múltiplos de 5: examen. Múltiplos de 3: leídos
    beforeEach(() => {
      cien = Array.from({ length: 100 }, (_, i) => {
        const correo = new Correo({
          asunto: i % 5 === 0 ? `Examen ${i}` : `Aviso ${i}`,
          remitente: i % 2 === 0 ? ana : luis,
        });
        if (i % 3 === 0) {
          correo.marcarComoLeido();
        }
        return correo;
      });
    });

    // Aplica el filtro con GestorFiltros y saca los asuntos con map (Estadisticas)
    const asuntosFiltrados = () =>
      estadisticas.obtenerAsuntos(gestor.aplicar(filtro, cien));

    // Cuenta a mano: pares y múltiplos de 5 = 0, 10, …, 90; sin los leídos (0, 30, 60, 90)
    it("encuentra exactamente los correos que cumplen", () => {
      expect(asuntosFiltrados()).toEqual([
        "Examen 10",
        "Examen 20",
        "Examen 40",
        "Examen 50",
        "Examen 70",
        "Examen 80",
      ]);
    });

    // El filtro no guarda correos: evalúa en el momento, así que ve el cambio
    it("refleja los cambios sin volver a guardar los correos", () => {
      cien[10].marcarComoLeido();
      expect(asuntosFiltrados()).not.toContain("Examen 10");
      expect(asuntosFiltrados()).toHaveLength(5);
    });

    // filter devuelve un arreglo nuevo: la colección y los correos quedan igual
    it("no modifica la colección ni los correos", () => {
      asuntosFiltrados();
      expect(cien).toHaveLength(100);
      expect(cien[0].asunto).toBe("Examen 0");
      expect(cien[0].leido).toBe(true);
      expect(cien[10].leido).toBe(false);
    });
  });
});
