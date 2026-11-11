import { Contacto } from '../src/Contacto';

describe('Contacto', () => {
  describe('creación (RF-01, RF-03)', () => {
    it('mantiene el nombre completo y el email con los que fue creado', () => {
      const contacto = new Contacto('Ana Pérez', 'ana.perez@ucp.edu.ar');

      expect(contacto.nombreCompleto).toBe('Ana Pérez');
      expect(contacto.email).toBe('ana.perez@ucp.edu.ar');
    });

    it('permite crear múltiples contactos independientes', () => {
      const ana = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');
      const luis = new Contacto('Luis Gómez', 'luis@gmail.com');

      expect(ana.nombreCompleto).toBe('Ana Pérez');
      expect(luis.nombreCompleto).toBe('Luis Gómez');
      expect(ana.email).not.toBe(luis.email);
    });
  });

  describe('normalización', () => {
    it('guarda el email en minúsculas y sin espacios en los extremos', () => {
      const contacto = new Contacto('Ana Pérez', '  Ana.Perez@UCP.edu.AR  ');

      expect(contacto.email).toBe('ana.perez@ucp.edu.ar');
    });

    it('guarda el nombre sin espacios en los extremos', () => {
      const contacto = new Contacto('  Ana Pérez  ', 'ana@ucp.edu.ar');

      expect(contacto.nombreCompleto).toBe('Ana Pérez');
    });
  });

  describe('validación del nombre', () => {
    it.each([['cadena vacía', ''], ['solo espacios', '   ']])(
      'rechaza un nombre con %s',
      (_descripcion, nombre) => {
        expect(() => new Contacto(nombre, 'ana@ucp.edu.ar')).toThrow(
          'El nombre completo es obligatorio'
        );
      }
    );
  });

  describe('validación del email (RF-03)', () => {
    it.each([
      'ana@ucp.edu.ar',
      'ana.perez@ucp.edu.ar',
      'ana_perez+facultad@gmail.com',
      'a@b.co',
      'ANA@UCP.EDU.AR',
    ])('acepta el email válido "%s"', (email) => {
      expect(() => new Contacto('Ana Pérez', email)).not.toThrow();
    });

    it.each([
      ['vacío', ''],
      ['solo espacios', '   '],
      ['sin arroba', 'anaucp.edu.ar'],
      ['sin parte local', '@ucp.edu.ar'],
      ['sin dominio', 'ana@'],
      ['dominio sin punto', 'ana@ucp'],
      ['dos arrobas', 'ana@@ucp.edu.ar'],
      ['espacio en el medio', 'ana perez@ucp.edu.ar'],
      ['puntos consecutivos en el dominio', 'ana@ucp..edu.ar'],
      ['dominio que empieza con punto', 'ana@.ucp.edu.ar'],
      ['dominio que termina en punto', 'ana@ucp.edu.ar.'],
    ])('rechaza el email inválido (%s)', (_descripcion, email) => {
      expect(() => new Contacto('Ana Pérez', email)).toThrow(
        'El formato del email no es válido'
      );
    });
  });

  describe('dominio', () => {
    it('devuelve el dominio del email (para filtros como @ucp.edu.ar)', () => {
      const contacto = new Contacto('Ana Pérez', 'Ana@UCP.edu.ar');

      expect(contacto.dominio).toBe('ucp.edu.ar');
    });
  });

  describe('igualdad', () => {
    it('dos contactos con el mismo email son iguales, aunque cambien nombre o mayúsculas', () => {
      const a = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');
      const b = new Contacto('Ana P.', 'ANA@ucp.edu.ar');

      expect(a.igualA(b)).toBe(true);
    });

    it('dos contactos con distinto email no son iguales', () => {
      const a = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');
      const b = new Contacto('Ana Pérez', 'ana@gmail.com');

      expect(a.igualA(b)).toBe(false);
    });
  });

  describe('inmutabilidad', () => {
    it('no permite modificar el nombre ni el email una vez creado', () => {
      const contacto = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');

      expect(() => {
        (contacto as any).nombreCompleto = 'Otro Nombre';
      }).toThrow();
      expect(() => {
        (contacto as any).email = 'otro@ucp.edu.ar';
      }).toThrow();

      expect(contacto.nombreCompleto).toBe('Ana Pérez');
      expect(contacto.email).toBe('ana@ucp.edu.ar');
    });
  });

  describe('representación en texto', () => {
    it('muestra nombre y email', () => {
      const contacto = new Contacto('Ana Pérez', 'ana@ucp.edu.ar');

      expect(contacto.toString()).toBe('Ana Pérez <ana@ucp.edu.ar>');
    });
  });
});