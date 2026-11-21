import { GestorFiltros } from "../src/GestorFiltros";
import { Filtro, crearFiltroUCP, crearFiltroPendientes } from "../src/Filtro";
import { FiltroCompuesto } from "../src/FiltroCompuesto";
import { Bandeja } from "../src/Bandeja";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

describe("GestorFiltros (RF-05)", () => {
  let gestor: GestorFiltros;
  let filtroUCP: Filtro;
  let filtroPendientes: Filtro;

  beforeEach(() => {
    gestor = new GestorFiltros();
    filtroUCP = crearFiltroUCP();
    filtroPendientes = crearFiltroPendientes();
  });

  describe("Registro de filtros", () => {
    it("permite registrar hasta 5 filtros personalizados", () => {
      for (let i = 0; i < 5; i++) {
        gestor.registrar(new Filtro(`Filtro ${i}`, () => true));
      }
      expect(gestor.listar().length).toBe(5);
    });

    it("registra un filtro compuesto como uno más de los cinco", () => {
      const compuesto = new FiltroCompuesto("UCP pendientes", "AND", [
        filtroUCP,
        filtroPendientes,
      ]);
      gestor.registrar(filtroUCP);
      gestor.registrar(compuesto);

      expect(gestor.listar()).toEqual([filtroUCP, compuesto]);
    });

    it("no registra dos filtros con el mismo nombre", () => {
      gestor.registrar(filtroUCP);

      expect(() => gestor.registrar(crearFiltroUCP())).toThrow(
        "Ya existe un filtro con ese nombre",
      );
      expect(gestor.listar()).toEqual([filtroUCP]);
    });

    it("impide registrar un sexto filtro", () => {
      for (let i = 0; i < 5; i++) {
        gestor.registrar(new Filtro(`Filtro ${i}`, () => true));
      }

      expect(() =>
        gestor.registrar(new Filtro("Filtro 6", () => true)),
      ).toThrow(/Límite alcanzado/);
    });
  });

  describe("Aplicación de filtros", () => {
    it("aplica un filtro compuesto sobre distintas bandejas", () => {
      const ana = new Contacto("Ana", "ana@ucp.edu.ar");
      const entrada = new Bandeja("Entrada");
      const eliminados = new Bandeja("Eliminados");
      const enEntrada = new Correo({ cuerpo: "Entrega 1", remitente: ana });
      const enEliminados = new Correo({ cuerpo: "Entrega 2", remitente: ana });
      entrada.agregar(enEntrada);
      eliminados.agregar(enEliminados);
      const compuesto = new FiltroCompuesto("UCP pendientes", "AND", [
        filtroUCP,
        filtroPendientes,
      ]);

      expect(gestor.aplicar(compuesto, entrada.correos)).toEqual([enEntrada]);
      expect(gestor.aplicar(compuesto, eliminados.correos)).toEqual([
        enEliminados,
      ]);
    });

    it("aplica un filtro a una colección de correos", () => {
      const ana = new Contacto("Ana", "ana@ucp.edu.ar");
      const correoUcp = new Correo({ remitente: ana });
      const otroCorreo = new Correo({
        remitente: new Contacto("Luis", "luis@gmail.com"),
      });

      const coleccion = [correoUcp, otroCorreo];
      const resultado = gestor.aplicar(filtroUCP, coleccion);

      expect(resultado).toContain(correoUcp);
      expect(resultado).not.toContain(otroCorreo);
      expect(resultado.length).toBe(1);
    });

    it("no modifica la colección original al aplicar un filtro", () => {
      const correoUcp = new Correo({
        remitente: new Contacto("Ana", "ana@ucp.edu.ar"),
      });
      const coleccion = [correoUcp];

      gestor.aplicar(filtroUCP, coleccion);

      // La colección original sigue intacta
      expect(coleccion.length).toBe(1);
      expect(coleccion).toContain(correoUcp);
    });

    it("no cambia el estado de los correos al aplicar un filtro", () => {
      const correo = new Correo({ cuerpo: "Entrega final" });
      correo.marcarFavorito();

      gestor.aplicar(filtroPendientes, [correo]);

      expect(correo.cuerpo).toBe("Entrega final");
      expect(correo.leido).toBe(false);
      expect(correo.favorito).toBe(true);
    });

    it("permite aplicar el mismo filtro sobre distintas colecciones o bandejas", () => {
      const correo1 = new Correo({ cuerpo: "Entrega 1" });
      const correo2 = new Correo({ cuerpo: "Entrega 2" });

      const bandejaA = [correo1];
      const bandejaB = [correo2];

      // Usamos el mismo filtro en dos bandejas distintas
      const resA = gestor.aplicar(filtroPendientes, bandejaA);
      const resB = gestor.aplicar(filtroPendientes, bandejaB);

      expect(resA.length).toBe(1);
      expect(resA[0]).toBe(correo1);
      expect(resB.length).toBe(1);
      expect(resB[0]).toBe(correo2);
    });
  });
});
