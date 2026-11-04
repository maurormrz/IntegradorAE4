# IntegradorAE4
## Gestor de Correos Electronicos con Filtros Dinamicos

Trabajo Practico Integrador (AE4) para la materia Paradigmas y Lenguajes de Programacion II.

Este sistema simula las operaciones principales de un cliente de correo electronico (bandejas, contactos, envio, borradores, favoritos y filtros personalizados), diseñado combinando Programacion Orientada a Objetos y Programacion Funcional utilizando TypeScript.

---

## Requisitos previos

Antes de comenzar, asegurate de tener instalado en tu computadora:
* Node.js (version 18 o superior recomendada). Puedes comprobar si lo tienes instalado abriendo tu terminal y escribiendo: `node -v`.
* Git para clonar y gestionar el repositorio.

---

## Guia paso a paso para ejecutar el proyecto en cualquier ordenador

### 1. Clonar el repositorio y abrir la carpeta
Abre tu terminal, clona el repositorio del proyecto y accede a la carpeta principal:

```bash
git clone https://github.com/maurormrz/IntegradorAE4
cd IntegradorAE4
```

### 2. Instalar las dependencias

Para preparar el entorno y descargar las herramientas necesarias (incluyendo el soporte para TypeScript y las pruebas), ejecuta el siguiente comando:
Bash

```bash
npm install --legacy-peer-deps
```

### 3. Ejecutar las pruebas automaticas y ver la cobertura

Para verificar que todo funcione correctamente y visualizar en la terminal la tabla detallada con los porcentajes de cobertura de codigo, ejecuta:
Bash

```bash
npm run test:coverage
```