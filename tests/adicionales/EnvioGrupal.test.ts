import { EnvioGrupal } from "../../src/adicionales/EnvioGrupal";
import { Contacto } from "../../src/Contacto";
import { GestorCorreos } from "../../src/GestorCorreos";
import { ServidorCorreo } from "../../src/ServidorCorreo";

describe("EnvioGrupal (lista de distribución)", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const cienAlumnos = Array.from(
    { length: 100 },
    (_, i) => new Contacto(`Alumno ${i}`, `alumno${i}@ucp.edu.ar`),
  );
  let servidor: ServidorCorreo;
  let cuentaDeAna: GestorCorreos;
  let alumnos: EnvioGrupal;

  // Cuenta del alumno número i
  const cuentaDelAlumno = (i: number) => servidor.cuentaDe(cienAlumnos[i]);

  beforeEach(() => {
    servidor = new ServidorCorreo();
    cuentaDeAna = servidor.registrar(ana);
    alumnos = new EnvioGrupal("Alumnos de Paradigmas");
    cienAlumnos.forEach((alumno) => {
      servidor.registrar(alumno);
      alumnos.agregarMiembro(alumno);
    });
  });

  describe("miembros", () => {
    it("guarda el nombre de la lista y sus 100 miembros", () => {
      expect(alumnos.nombre).toBe("Alumnos de Paradigmas");
      expect(alumnos.miembros()).toEqual(cienAlumnos);
    });

    it("no acepta un miembro repetido", () => {
      const repetido = new Contacto("Otro nombre", "ALUMNO0@ucp.edu.ar");

      expect(() => alumnos.agregarMiembro(repetido)).toThrow(
        "Ya existe un contacto con ese email",
      );
      expect(alumnos.miembros()).toHaveLength(100);
    });
  });

  describe("envío a los 100 alumnos", () => {
    const enviarAviso = () =>
      alumnos.enviar(cuentaDeAna, "Aviso general", "Mañana no hay clase");

    it("queda en Enviados de Ana y en la Entrada de cada alumno", () => {
      const enviado = enviarAviso();

      expect(cuentaDeAna.enviados.correos).toEqual([enviado]);
      expect(cuentaDeAna.borradores.cantidad).toBe(0);
      cienAlumnos.forEach((alumno) => {
        const entrada = servidor.cuentaDe(alumno).entrada;
        expect(entrada.cantidad).toBe(1);
        expect(entrada.correos[0].asunto).toBe("Aviso general");
        expect(entrada.correos[0].remitente).toBe(ana);
      });
    });

    it("cada alumno tiene su copia: si uno la lee, los demás no cambian", () => {
      enviarAviso();
      cuentaDelAlumno(0).entrada.correos[0].marcarComoLeido();

      expect(cuentaDelAlumno(0).entrada.correos[0].leido).toBe(true);
      expect(cuentaDelAlumno(99).entrada.correos[0].leido).toBe(false);
    });

    it("un alumno elimina su copia y la restaura sin afectar a los demás", () => {
      enviarAviso();
      const cuenta = cuentaDelAlumno(5);
      const copia = cuenta.entrada.correos[0];

      cuenta.eliminar(copia);
      expect(cuenta.entrada.cantidad).toBe(0);
      expect(cuenta.eliminados.correos).toEqual([copia]);
      expect(cuentaDelAlumno(6).entrada.cantidad).toBe(1);

      cuenta.restaurar(copia);
      expect(cuenta.entrada.correos).toEqual([copia]);
    });

    it("un aviso sin asunto no le llega a nadie y queda en Borradores", () => {
      expect(() => alumnos.enviar(cuentaDeAna, " ", "Sin asunto")).toThrow(
        "asunto",
      );
      expect(cuentaDeAna.borradores.cantidad).toBe(1);
      expect(cuentaDeAna.enviados.cantidad).toBe(0);
      expect(cuentaDelAlumno(0).entrada.cantidad).toBe(0);
    });
  });
});
