import { useState } from "react";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { convert } from "../../../../utils/curlParser";

const CurlModal = (props) => {
  const [curl, setCurl] = useState("");
  const [error, setError] = useState("");

  const handleConfirmModal = () => {
    try {
      // Validar que el input no esté vacío
      if (!curl.trim()) {
        setError("Por favor ingrese un comando cURL válido");
        return;
      }

      // Convertir el comando CURL
      const requests = convert(curl);
      if (requests && requests.length > 0) {
        const firstRequest = requests[0];
        
        // Validar body JSON si existe
        let bodyData = null;
        if (Object.keys(firstRequest.body).length && firstRequest.body.text) {
          try {
            bodyData = JSON.parse(firstRequest.body.text);
          } catch (jsonError) {
            setError("El formato del JSON en el comando cURL es inválido");
            return;
          }
        }
        
        const data = {
          url: firstRequest.url,
          method_type: firstRequest.method,
          body: bodyData,
          headers: arrayToObject(firstRequest.headers),
          query_params: arrayToObject(firstRequest.parameters),
        };

        props.onConfirm(data);
      } else {
        setError("No se pudo convertir el comando cURL. Asegúrese de que el formato sea correcto.");
      }
    } catch (error) {
      console.error("Error al procesar el comando cURL:", error);
      setError("Ocurrió un error al procesar el comando cURL");
    }
  };

  function arrayToObject(input) {
    if (!input || input.length === 0) return null;
    const result = input.reduce((acc, obj) => {
      acc[obj.name] = obj.value;
      return acc;
    }, {});
    return result;
  }

  return (
    <Dialog open={true} onOpenChange={() => props.onCancel()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Pegar comando cURL</DialogTitle>
          <DialogDescription>
            Ingrese el comando cURL para importar la configuración de la solicitud.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            className="min-h-[65vh] font-mono"
            value={curl}
            onChange={(e) => {
              setCurl(e.target.value);
              setError(""); // Limpiar errores al modificar
            }}
            placeholder="curl https://api.ejemplo.com"
          />
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={props.onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmModal}>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CurlModal; 