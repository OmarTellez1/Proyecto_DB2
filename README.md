Proyecto Parcial 2 - Base de datos 2

Este proyecto seria realizado con las siguientes tecnologias por el momento:

Tecnologias:
Frontend: HTML+CSS+JS (Los que hacen el frontend deciden si usar frameworks o no)
Backend: Nodejs con expressjs
Base de datos: PostgreSQL

Con respecto al backend:
[
    Requerimientos:
    Para poder correr el backend se necesita tener instalado "node js" y "npm" que es el gestor de paquetes de las independencias.
    Para poder descargar las dependencias del backend, primero debemos movernos a la carpeta del backend con el comando "cd backend" y luego en la terminal escribir
    "npm install".
    Es necesario tener instaladas las dependencias y nodejs para poder correr el programa.
    La carpeta node_modules es la que contiene todos los archivos de las dependencias, eso no se toca.
    Si tu proyecto no tiene el node_modules significa que no tienes las dependencias instaladas.

    Scripts:
    Dentro del package.json se puede visualizar los scripts ejecutables que son para correr el servidor del programa
    los scripts se escriben ubicados en la raiz del proyecto en la terminal, estos scripts son:
    |--------------------------------------------------------------------------------------------------------------------|
    "npm run start" : este script inicializa el servidor pero no escucha por cambios, es decir, si se hace algun cambio en los archivos,
    estos cambios no se veran reflejados al instante, se tendra que volver a ejecutar el script.

    "npm run dev" : Este script corre el servidor del programa y si escucha por cambios de archivos.
    |--------------------------------------------------------------------------------------------------------------------|
    Importante: En la raiz de la carpeta de backend "ProyectoDB2/backend" se debe crear el archivo " .env " que son las variables de entorno, estas son importantes para que el backend funcione. Para ser más claro se debe crear el archivo ".env" al mismo nivel de donde esta el ".gitignore".

]
Importante: Es necesario tener todo lo del backend para que se pueda correr la aplicación.

Con respecto a la base de datos: 
[
    1. Se debe crear la base de datos en postgresql
    2. El nombre de la base de datos debe ser DB2_Proyecto
    3. Escriban al grupo o a mi al privado para que les pase el script a ejecutar de la base de datos.
    4. Una vez ya ejecuten el script, la base de datos ya estara funcionando.
]

Correr la aplicación una vez que el frontend se comunique con el backend:
[
    Para correr la aplicación necesitamos tener instalada la extensión de live server, este sera 1 de los 2 servidores necesarios.
    El segundo servidor es el que se crea en el backend y se activa cuando ejecutamos el script "npm run dev".

    Paso 1: En la carpeta del frontend nos dirijimos al index.html o al archivo que html principal y presionamos clic derecho en el archivo y le damos a open with live server.
    Paso 2: En la terminal nos movemos a la carpeta del backend y luego le damos a "npm run dev".

    Por que debe ser así? De esta manera el frontend se puede comunicar con el backend y la aplicación puede funcionar correctamente.
]

Estructura de carpetas y archivos:
-Yo Omar Téllez trabajare en el backend, asi que yo mantendre mi estructura de carpetas y archivos así.
-Se trabajara con la estructura ya establecida, dentro de las carpetas del frontend hay más carpetas con archivos vacios
esos archivos vacios se pueden modificar, eliminar o lo que sea.
-Lo mejor seria si las carpetas ya establecidas no son eliminadas, pero si quieren hacerlo de otra manera pueden.
-Sí se puede agregar mas carpetas o mas archivos, todo lo que necesiten.
