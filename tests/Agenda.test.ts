import { Agenda } from "../src/Agenda";
import { Contacto } from "../src/Contacto";

describe("Agenda", () => {
  it("debería agregar un contacto y evitar duplicados por email", () => {
    const agenda = new Agenda();
    const c1 = new Contacto("Ana", "ana@ucp.edu.ar");
    const c2 = new Contacto("Ana Repetida", "ana@ucp.edu.ar");

    agenda.agregarContacto(c1);
    agenda.agregarContacto(c2);

    expect(agenda.consultarContactos().length).toBe(1);
  });
});