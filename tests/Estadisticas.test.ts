import { Estadisticas } from "../src/Estadisticas";
import { Correo } from "../src/Correo";
import { esFavorito, esNoLeido } from "../src/Predicados";
import { Contacto } from "../src/Contacto";

describe("Estadisticas (RF-10)", () => {
  let estadisticas: Estadisticas;
  let correo1: Correo;
  let correo2: Correo;
  let coleccion: Correo[];

  beforeEach(() => {
    estadisticas = new Estadisticas();
    const remitente = new Contacto("Ana", "ana@ucp.edu.ar");
    
    correo1 = new Correo({ asunto: "Examen", remitente });
    correo2 = new Correo({ asunto: "Reunión", remitente });
    correo2.marcarFavorito();
    
    coleccion = [correo1, correo2];
  });

  describe("obtenerAsuntos (map)", () => {
    it("devuelve un arreglo con los asuntos de los correos", () => {
      const asuntos = estadisticas.obtenerAsuntos(coleccion);
      expect(asuntos).toEqual(["Examen", "Reunión"]);
    });

    it("devuelve un arreglo vacío si no hay correos", () => {
      expect(estadisticas.obtenerAsuntos([])).toEqual([]);
    });
  });

  describe("filtrarCorreos (filter)", () => {
    it("devuelve solo los correos que cumplen la condición (ej. favoritos)", () => {
      const favoritos = estadisticas.filtrarCorreos(coleccion, esFavorito());
      
      expect(favoritos.length).toBe(1);
      expect(favoritos[0]).toBe(correo2);
    });

    it("devuelve todos si la condición se cumple para todos (ej. no leídos)", () => {
      const noLeidos = estadisticas.filtrarCorreos(coleccion, esNoLeido());
      
      expect(noLeidos.length).toBe(2);
    });

    it("no modifica la colección original al filtrar", () => {
      estadisticas.filtrarCorreos(coleccion, esFavorito());
      
      // La colección original sigue teniendo 2 correos
      expect(coleccion.length).toBe(2); 
    });
  });
});