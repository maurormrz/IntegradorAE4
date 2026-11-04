import { Contacto } from "../src/Contacto";

describe("Contacto", () => {
  it("debería crear un contacto válido con nombre y email", () => {
    const contacto = new Contacto("Juan Perez", "juan@ucp.edu.ar");

    expect(contacto.nombre).toBe("Juan Perez");
    expect(contacto.email).toBe("juan@ucp.edu.ar");
  });
});