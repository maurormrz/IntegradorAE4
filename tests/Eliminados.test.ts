import { Bandeja } from "../src/Bandeja";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import { Eliminados } from "../src/Eliminados";

// Guía: Eliminados es una Bandeja que además recuerda de dónde vino cada correo.
// Se prueba sola, con bandejas sueltas, sin cuentas ni servidor.
describe("Eliminados (RF-06)", () => {
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  let entrada: Bandeja;
  let enviados: Bandeja;
  let eliminados: Eliminados;
  let correo: Correo;

  // Antes de cada test: bandejas nuevas y un correo en Entrada (tests independientes)
  beforeEach(() => {
    entrada = new Bandeja("Entrada");
    enviados = new Bandeja("Enviados");
    eliminados = new Eliminados();
    correo = new Correo({ asunto: "Aviso", remitente: ana });
    entrada.agregar(correo);
  });

  // Herencia (Liskov): Eliminados se puede usar como cualquier Bandeja
  it("es una bandeja llamada Eliminados que empieza vacía", () => {
    expect(eliminados).toBeInstanceOf(Bandeja);
    expect(eliminados.nombre).toBe("Eliminados");
    expect(eliminados.cantidad).toBe(0);
  });

  // Eliminación lógica: el correo no se borra, se mueve a Eliminados
  it("recibe un correo y lo saca de su bandeja de origen", () => {
    eliminados.recibirDe(entrada, correo);

    expect(entrada.contiene(correo)).toBe(false);
    expect(eliminados.correos).toEqual([correo]);
  });

  // Cada correo vuelve a SU bandeja: el Map recuerda el origen de cada uno
  it("restaura cada correo a su bandeja de origen exacta", () => {
    const enviado = new Correo({ asunto: "Enviado", remitente: ana });
    enviados.agregar(enviado);
    eliminados.recibirDe(entrada, correo);
    eliminados.recibirDe(enviados, enviado);

    eliminados.restaurar(enviado);
    eliminados.restaurar(correo);

    expect(entrada.correos).toEqual([correo]);
    expect(enviados.correos).toEqual([enviado]);
    expect(eliminados.cantidad).toBe(0);
  });

  // RF-09: un favorito eliminado sigue siendo favorito, también al restaurarlo
  it("conserva el estado de leído y favorito del correo", () => {
    correo.marcarComoLeido();
    correo.marcarFavorito();

    eliminados.recibirDe(entrada, correo);
    expect(correo.leido).toBe(true);
    expect(correo.favorito).toBe(true);

    eliminados.restaurar(correo);
    expect(correo.favorito).toBe(true);
  });

  // Sin duplicados: moverA falla porque el correo ya no está en Entrada
  it("no elimina dos veces el mismo correo", () => {
    eliminados.recibirDe(entrada, correo);

    expect(() => eliminados.recibirDe(entrada, correo)).toThrow(/no pertenece/);
    expect(eliminados.cantidad).toBe(1);
  });

  // Solo se restaura lo que está en Eliminados; al restaurar, el origen se olvida
  it("no restaura un correo que no está en Eliminados", () => {
    expect(() => eliminados.restaurar(correo)).toThrow(
      "El correo no está en Eliminados",
    );

    eliminados.recibirDe(entrada, correo);
    eliminados.restaurar(correo);
    expect(() => eliminados.restaurar(correo)).toThrow(
      "El correo no está en Eliminados",
    );
  });
});
