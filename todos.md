##Lo que voy
crear app con wails
configurarle el backend hecho
testear que funcione
empezar con el front ver de armar layout con react y ant
usar el procesador LESS para usar variables en los css
crear rutas
arreglar problema al recargar la pagina se perdia el windows.go
crear sidebar principal
crear footer
crear header
crear vista de Operation Schemas
operation schemas -> crear sidebar
operation schemas -> agregar buscador de schemas
operation schemas -> editar nombre
operation schemas -> crear layout de contenido con dos partes: la que muestra todos los datos del curl y la que muestra el schema
operation schemas -> agregar schema por medio de dos opciones: cargando los datos manual o cargando un comando CURL
crear y configurar repositorios git para hacer 3 proyectos: back, front y "compiler"
Operation Template -> Estoy en la vista de templates, viendo como se manejan los parametros en relacion a los templates
Operation Template -> Save Template
Operation Template -> Create and Delete Templates
Operation Template -> Revisar si el backend soporta bodys, creo que no. Si no lo soporta entonces no hacemos los parametros de body ahora
Diseñar el layout de la vista de flows
Armando la vista de flows, ya cree el nodo input que se va agregando las propiedades que se van a mapear del archivo, tambien cree el nodo de los templates y como se conectan todos estos nodos. El del template tiene la parte de parametros y la parte de propiedades de respuesta con un check para a futuro usarlo para crear los responses fields del usuario
Armando el CURL de flows, ya tengo el getall, el delete y el insert, ahora estoy con el update. Puntualmente implementando el rename que esta fallando por las propiedades
Arreglado el delete, rename, visualizacion, actualizacion y como se muestran los flows. Es decir termine con la parte de flows.
Voy a empezar a trabajar con los fields responses en la vista de flows
Fields Response -> Ya tengo hecha la parte de crear uno cuando se crea un flow nuevo, cargar los existentes, como se modifican los campos del listado a la vez que esta sincronizado con los nodos del flow y tambien la logica de guardado del flow ahora incluye el de los fields response
Fields response -> Crear nuevo
Fields response -> Editar nombre
Fields response -> Borrar uno
Fields response -> Mejorar lo visual en la sidebar
Analizar pantalla de process y pensar ux y ui
Process View -> Get all, vista general de cards
Process View -> Filtro de cards
Process View -> Modal de nuevo process
Process View -> Ejecución del proceso
Process View -> Mejoras visuales
Process View -> Duplicar proceso
Process View -> Delete process pendientes

##Lo que estoy ahora

## Lo que falta
Process Result -> Hacer el analisis de UX y UI de como voy a mostrar los resultados


Bardometro:
Fields response:
    -> Quitar que todo el tiempo haga location(url) esto hace que se muevan las cosas de lugar. Hacer solo cuando sea necesario
    -> Reveer logica de actualizacion de campos en los nodos del flow ya que todo el tiempo se estan actualizando al marcar o desmarcar un check
    -> Al eliminar un campo del listado en la sidebar si tiene que reflejar en los nodos (deseable)
    -> Hoy en dia para cursar un flow los fields response conectores tienen que estar checkeados. Poner una validacion antes de ejecutar o forzarlo

General:
    -> Hay respuestas json que arrancan como listas [] y no como objetos {}, en estos casos rompe el parseo del test endpoint. Ejemplo: https://jsonplaceholder.typicode.com/posts?userId=1
    -> Mejorar el manejo de errores y logs. Agregar tags


Comando para ver la DB en web:
boltdbweb --db-name=./backend/files/db/db_test.db