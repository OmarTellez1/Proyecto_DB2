Proyecto Parcial 2 - Base de datos 2

Este proyecto seria realizado con las siguientes tecnologias por el momento:

Tecnologias:
Frontend: HTML+CSS+JS (Los que hacen el frontend deciden si usar frameworks o no)
Backend: Nodejs con expressjs
Base de datos: PostgreSQL

Requerimientos:
Para poder correr este programa se necesita tener instalado "node js"
Para poder descargar las dependencias del proyecto hay que ejecutar el siguiente comando en la raiz del proyecto " npm install "
|---Es necesario tener instaladas las dependencias y nodejs para poder correr el programa.
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
