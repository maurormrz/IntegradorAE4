import { Favoritos } from "../../src/adicionales/Favoritos";
import { Contacto } from "../../src/Contacto";
import { Correo } from "../../src/Correo";
import { GestorCorreos } from "../../src/GestorCorreos";
import { ServidorCorreo } from "../../src/ServidorCorreo";
import {
  and,
  asuntoIncluye,
  deDominio,
  esNoLeido,
  not,
  or,
} from "../../src/Predicados";

describe("Favoritos", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis Gómez", "luis@gmail.com");
  let cuentaDeAna: GestorCorreos;
  let favoritos: Favoritos;
  let examen: Correo;
  let fiesta: Correo;
  let proyecto: Correo;

  beforeEach(() => {
    cuentaDeAna = new ServidorCorreo().registrar(ana);
    favoritos = new Favoritos(cuentaDeAna);
    examen = new Correo({ asunto: "Examen final", remitente: ana });
    fiesta = new Correo({ asunto: "Fiesta", remitente: luis });
    proyecto = cuentaDeAna.crearBorrador({ asunto: "Proyecto" });
    cuentaDeAna.recibir(examen);
    cuentaDeAna.recibir(fiesta);
    // Es de la UCP, pero nunca se marca como favorito
    cuentaDeAna.recibir(new Correo({ asunto: "Aviso", remitente: ana }));
  });

  describe("marcar y consultar", () => {
    it("lista los favoritos de cualquier bandeja sin moverlos", () => {
      favoritos.marcar(examen);
      favoritos.marcar(proyecto);

      expect(favoritos.listar()).toEqual([examen, proyecto]);
      expect(cuentaDeAna.entrada.contiene(examen)).toBe(true);
      expect(cuentaDeAna.borradores.contiene(proyecto)).toBe(true);
    });

    it("no duplica un favorito y desmarcar lo quita", () => {
      favoritos.marcar(examen);
      favoritos.marcar(examen);
      expect(favoritos.listar()).toEqual([examen]);

      favoritos.desmarcar(examen);
      expect(favoritos.listar()).toEqual([]);
    });

    it("oculta los eliminados y los muestra al restaurarlos", () => {
      favoritos.marcar(examen);
      cuentaDeAna.eliminar(examen);
      expect(favoritos.listar()).toEqual([]);
      expect(cuentaDeAna.eliminados.contiene(examen)).toBe(true);
      expect(examen.favorito).toBe(true);

      cuentaDeAna.restaurar(examen);
      expect(favoritos.listar()).toEqual([examen]);
    });
  });

  describe("filtrar con funciones de orden superior", () => {
    beforeEach(() => {
      [examen, fiesta, proyecto].forEach((correo) => favoritos.marcar(correo));
    });

    it("devuelve solo los favoritos que cumplen el predicado", () => {
      const deLaUcp = favoritos.filtrar(deDominio("ucp.edu.ar"));
      expect(deLaUcp).toEqual([examen, proyecto]);
    });

    it("combina predicados con and, or y not", () => {
      const examenUcp = and(deDominio("ucp.edu.ar"), asuntoIncluye("Examen"));
      const otros = or(asuntoIncluye("Fiesta"), asuntoIncluye("Proyecto"));

      expect(favoritos.filtrar(examenUcp)).toEqual([examen]);
      expect(favoritos.filtrar(otros)).toEqual([fiesta, proyecto]);
      expect(favoritos.filtrar(not(deDominio("ucp.edu.ar")))).toEqual([fiesta]);
    });

    it("acepta una lambda propia como condición", () => {
      cuentaDeAna.editarBorrador(proyecto, { destinatarios: [luis, ana] });
      const variosDestinos = (c: Correo) => c.destinatarios.length > 1;
      expect(favoritos.filtrar(variosDestinos)).toEqual([proyecto]);
    });

    it("refleja los cambios sin volver a guardar los correos", () => {
      expect(favoritos.filtrar(esNoLeido())).toHaveLength(3);
      examen.marcarComoLeido();
      expect(favoritos.filtrar(esNoLeido())).toEqual([fiesta, proyecto]);
    });

    it("devuelve una lista vacía si ninguno cumple y no altera los favoritos", () => {
      expect(favoritos.filtrar(asuntoIncluye("inexistente"))).toEqual([]);
      expect(favoritos.listar()).toEqual([examen, fiesta, proyecto]);
    });
  });
});
