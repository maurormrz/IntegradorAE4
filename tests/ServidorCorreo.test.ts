import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import { GestorCorreos } from "../src/GestorCorreos";
import { ServidorCorreo } from "../src/ServidorCorreo";

// Guía: el servidor registra una cuenta por usuario y entrega los correos.
// Corrección del profesor: bandejas separadas por persona; cada una recibe su copia.
describe("ServidorCorreo (RF-02, RF-06)", () => {
  // Contactos del ejemplo; "desconocido" no tiene cuenta en el servidor
  const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
  const luis = new Contacto("Luis Gómez", "luis@gmail.com");
  const sofia = new Contacto("Sofía Díaz", "sofia@ucp.edu.ar");
  const marcos = new Contacto("Marcos Ruiz", "marcos@gmail.com");
  const desconocido = new Contacto("Nadie", "nadie@gmail.com");
  let servidor: ServidorCorreo;
  let cuentaDeAna: GestorCorreos;
  let cuentaDeLuis: GestorCorreos;
  let cuentaDeSofia: GestorCorreos;
  let cuentaDeMarcos: GestorCorreos;

  // Cada test empieza con un servidor nuevo y cuatro cuentas vacías
  beforeEach(() => {
    servidor = new ServidorCorreo();
    cuentaDeAna = servidor.registrar(ana);
    cuentaDeLuis = servidor.registrar(luis);
    cuentaDeSofia = servidor.registrar(sofia);
    cuentaDeMarcos = servidor.registrar(marcos);
  });

  // Ana le escribe a tres personas
  const enviarATres = (): Correo => {
    const borrador = cuentaDeAna.crearBorrador({
      asunto: "Reunión de grupo",
      cuerpo: "Nos vemos el lunes",
      destinatarios: [luis, sofia, marcos],
    });
    cuentaDeAna.enviar(borrador);
    return borrador;
  };

  // Registro: una cuenta por email, sin repetidos
  describe("registro de usuarios", () => {
    it("crea una cuenta con sus cuatro bandejas vacías", () => {
      const { entrada, enviados, borradores, eliminados } = cuentaDeAna;

      expect(servidor.cuentaDe(ana)).toBe(cuentaDeAna);
      expect(cuentaDeAna.propietario).toBe(ana);
      [entrada, enviados, borradores, eliminados].forEach((bandeja) =>
        expect(bandeja.cantidad).toBe(0),
      );
    });

    // El email se compara sin mayúsculas: "ANA@" es la misma Ana
    it("no registra dos veces el mismo email", () => {
      const otraAna = new Contacto("Otra Ana", "ANA@ucp.edu.ar");
      expect(() => servidor.registrar(otraAna)).toThrow(
        "ana@ucp.edu.ar ya está registrado",
      );
    });

    it("avisa si se busca un usuario que no está registrado", () => {
      expect(() => servidor.cuentaDe(desconocido)).toThrow(
        "nadie@gmail.com no está registrado",
      );
    });
  });

  // El caso del profesor: Ana envía un correo a 3 personas
  describe("envío de Ana a tres personas", () => {
    // El original queda en Enviados de Ana y cada destinatario lo tiene en su Entrada
    it("queda en Enviados de Ana y en la Entrada de cada destinatario", () => {
      const enviado = enviarATres();

      expect(cuentaDeAna.enviados.correos).toEqual([enviado]);
      expect(cuentaDeAna.borradores.cantidad).toBe(0);
      [cuentaDeLuis, cuentaDeSofia, cuentaDeMarcos].forEach((cuenta) => {
        expect(cuenta.entrada.cantidad).toBe(1);
        // toString muestra de quién a quién va: igual que el original
        expect(cuenta.entrada.correos[0].toString()).toBe(enviado.toString());
      });
    });

    // Copias propias: 4 ids distintos (original + 3 copias). Lo recibido no se edita
    it("cada destinatario recibe su propia copia, con otro id", () => {
      const enviado = enviarATres();
      const copias = [cuentaDeLuis, cuentaDeSofia, cuentaDeMarcos].map(
        (cuenta) => cuenta.entrada.correos[0],
      );

      const ids = new Set([enviado.id, ...copias.map((copia) => copia.id)]);
      expect(ids.size).toBe(4);
      expect(() => copias[0].editar({ asunto: "Otro" })).toThrow(
        "Un correo enviado no se puede editar",
      );
    });

    // Como cada uno tiene su copia, leer la suya no cambia la de los demás
    it("si Sofía lo lee, la copia de Marcos sigue sin leer", () => {
      enviarATres();
      cuentaDeSofia.entrada.correos[0].marcarComoLeido();

      expect(cuentaDeSofia.entrada.correos[0].leido).toBe(true);
      expect(cuentaDeMarcos.entrada.correos[0].leido).toBe(false);
    });

    // Eliminar es por cuenta: solo cambian las bandejas de Luis
    it("si Luis lo elimina, las otras copias siguen en su lugar", () => {
      const enviado = enviarATres();
      const copiaDeLuis = cuentaDeLuis.entrada.correos[0];

      cuentaDeLuis.eliminar(copiaDeLuis);

      expect(cuentaDeLuis.entrada.cantidad).toBe(0);
      expect(cuentaDeLuis.eliminados.correos).toEqual([copiaDeLuis]);
      expect(cuentaDeSofia.entrada.cantidad).toBe(1);
      expect(cuentaDeMarcos.entrada.cantidad).toBe(1);
      expect(cuentaDeAna.enviados.correos).toEqual([enviado]);
    });
  });

  // Reglas que evitan duplicados o entregas a medias (RF-02)
  describe("reglas de entrega", () => {
    // new Set deja una sola cuenta aunque Luis aparezca 3 veces
    it("un destinatario repetido recibe una sola copia", () => {
      const mismoLuis = new Contacto("Luis G.", "LUIS@gmail.com");
      const borrador = cuentaDeAna.crearBorrador({
        asunto: "Hola",
        destinatarios: [luis, mismoLuis, luis],
      });
      cuentaDeAna.enviar(borrador);

      expect(cuentaDeLuis.entrada.cantidad).toBe(1);
    });

    // Entrega atómica: primero se buscan todas las cuentas; si falta una, no se entrega nada
    it("si un destinatario no tiene cuenta, no se le entrega a nadie", () => {
      const borrador = cuentaDeAna.crearBorrador({
        asunto: "Hola",
        destinatarios: [luis, desconocido],
      });

      expect(() => cuentaDeAna.enviar(borrador)).toThrow(/no está registrado/);
      expect(cuentaDeLuis.entrada.cantidad).toBe(0);
      expect(cuentaDeAna.borradores.contiene(borrador)).toBe(true);
      expect(cuentaDeAna.enviados.cantidad).toBe(0);
    });

    // Un correo que ya está en Enviados no se vuelve a enviar
    it("reenviar el mismo correo no entrega copias de más", () => {
      const enviado = enviarATres();

      expect(() => cuentaDeAna.enviar(enviado)).toThrow(/Enviados/);
      expect(cuentaDeLuis.entrada.cantidad).toBe(1);
    });
  });
});
