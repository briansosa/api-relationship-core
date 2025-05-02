# README

## About

Este proyecto tiene la intención de ser una aplicación de escritorio la cual permitia crear flujos de trabajos pegandole a diferentes APIs que se relacionan entre si mediante sus datos de entrada y de salida. De una forma muy eficiente, dinamica, optimizado para procesar una gran cantidad de datos. Para uso analitico, scripts, automatización, recolección de datos, y muchos mas. Ya que hoy en día casi todos los servidores exponen APIs para comunicarse entre si.

La intención era poder cargar varias Request Http, la cual una vez que se ejecutaban (como lo hace Postman u Insomnia por ejemplo) mostraba el Response. La diferencia radica en el paso posterior, que a esa request la cual denominaba "Schema" servía para parametrizarla posteriormente. De forma que te quedaban X requests que partian de la base del Schema pero cada una tenia sus valores y definia sus parámetros de entrada. A estas request parametrizadas las denominé "Templates".

Hasta este punto entonces, tenemos los Schemas que son las request default a un endpoint y los Templates que definen los parametros de entrada y los valores de la request. También se conoce los campos de respuesta de esa request ya que se ejecutó en un primer momento.

Al tener varios Templates de distintos Schemas entonces se puede jugar a crear un flujo de relaciones entre sí conectando unos valores iniciales a los parámetros de entrada de un Template y luego de la ejecución de esta request, se pueden usar las propiedades de la respuesta como inputs de uno o mas Templates que se relacionen. De esta forma, conseguir un flujo de trabajo con diferentes endpoints.

Para hacerlo eficiente en el backend se implementaron bastantes tecnicas, como la recursividad y go routines para soportar una alta carga. Los inputs de entrada esta hecho para que sea un CSV con gran cantidad de datos (formato que admite, pero podia extenderse a cualquier otro). Se leia el csv y se iba ejecutan en paralelo las request. Se puede configurar la cantidad de go routines se quiere utilizar en la ejecución para poder derretir la CPU si da la gana.

Tiene una base de datos embedida para que sea portable, de facil instalación y ayudaba a ordenar un poco el código.

También tiene un módulo para visualizar la salida de estos datos en un formato de tabla donde se pueden ordenar, filtrar, etc. La intención es luego poder jugar y agregar gráficos dinámicamente mediante alguna AI para que ayude a la parte analitica.

## Proyecto descontinuado

Si bien es un proyecto que me gusta mucho y que lo tengo en mente hace muchisimo tiempo, entiendo que hay competencia muy grande y que hoy en día arrasa el mercado como es Postman. Ellos tienen una seccion "Postman Flows" la cual es similar, pero con mil features más. Aunque el enfoque que tiene es diferente, esta hecho para abarcar más casos pero no para alta carga, también esta enfocado en devs y es pago luego de X peticiones. De igual forma, me desgasta saber que tengo que dedicar muchisimo tiempo para terminar la app de una forma que verdaderamente agregue valor.
No buscaba competir ni que me sea reditable, más bien tener la satisfacción de completar el proyecto y entender si podía ayudar a alguien, además de a mi y mejorarlo mediante feedback. Pero el tiempo que lleva, sumado a que con las nuevas tecnologias de AI se pueden crear muchas cosas de forma rápida, me dan ganas de enfocarme en cosas que pueden generar mucho más valor siendo más simple.
Por estos motivos decido descontinuar el proyecto.