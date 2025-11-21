# España Corrupta

Un marcador no oficial que rastrea acusaciones y sentencias en casos de corrupción en España. Este es un sitio web estático construido con Next.js y alojado en Firebase Hosting.

## Empezando

Sigue estas instrucciones para obtener una copia local del proyecto en funcionamiento para desarrollo y pruebas, y para desplegarlo en producción.

### Prerrequisitos

Asegúrate de tener instalado lo siguiente:

*   [Node.js](https://nodejs.org/) (versión 18 o superior)
*   [Firebase CLI](https://firebase.google.com/docs/cli#install-cli-windows)

### Instalación

1.  Clona el repositorio o descarga el código fuente.
2.  Abre una terminal en el directorio raíz del proyecto.
3.  Instala las dependencias del proyecto ejecutando:

    ```bash
    npm install
    ```

## Desarrollo Local

Para iniciar el servidor de desarrollo y ver el sitio en tu máquina local, ejecuta:

```bash
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador para ver el resultado.

Puedes empezar a editar la página modificando `src/app/page.tsx`. La página se actualiza automáticamente a medida que editas el archivo.

## Compilación y Despliegue

Este sitio está configurado para ser un sitio estático y desplegado en Firebase Hosting.

### 1. Compilar el Sitio

Para compilar el sitio para producción, ejecuta el siguiente comando:

```bash
npm run build
```

Este comando generará una versión estática y optimizada de tu sitio en la carpeta `out`.

### 2. Desplegar en Firebase Hosting

Sigue estos pasos para desplegar tu sitio:

1.  **Inicia sesión en Firebase:**
    Si aún no lo has hecho, inicia sesión en tu cuenta de Google a través de la Firebase CLI:

    ```bash
    firebase login
    ```

2.  **Despliega el sitio:**
    Usa el siguiente comando para desplegar los contenidos de la carpeta `out` en Firebase Hosting:

    ```bash
    firebase deploy --only hosting
    ```

Una vez que el comando finalice, la CLI de Firebase te proporcionará la URL donde tu sitio está desplegado y accesible públicamente.