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

##Lo que estoy ahora
Voy a empezar a trabajar con los fields responses en la vista de flows

## Lo que falta




Comando para ver la DB en web:
boltdbweb --db-name=./backend/files/db/db_test.db