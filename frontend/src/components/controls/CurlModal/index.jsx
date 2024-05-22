import { useState } from "react";
import { Modal, Input } from "antd";
import { convert } from "../../../utils/curlParser";

const CurlModal = (props) => {
  const [curl, setCurl] = useState("");

  const handleConfirmModal = () => {
    const requests = convert(curl);
    if (requests && requests.length > 0) {
      const firstRequest = requests[0];
      const data = {
        url: firstRequest.url,
        method_type: firstRequest.method,
        body: Object.keys(firstRequest.body).length ? JSON.parse(firstRequest.body.text) : null,
        headers: arrayToObject(firstRequest.headers),
        query_params: arrayToObject(firstRequest.parameters),
      };

      props.onConfirm(data);
    } else {
      console.log("No se pudo convertir el comando cURL.");
      // TODO validate and set warning
    }
  };

  function arrayToObject(input) {
    if (!input || input.length == 0) return null;
    const result = input.reduce((acc, obj) => {
      acc[obj.name] = obj.value;
      return acc;
    }, {});
    return result
  }

  return (
    <>
      <Modal
        title="Paste Curl"
        centered
        open={true}
        onOk={handleConfirmModal}
        onCancel={props.onCancel}
      >
        <Input.TextArea
          style={{ height: "65vh" }}
          rows={40}
          name="curl"
          value={curl}
          onChange={(e) => {
            setCurl(e.target.value);
          }}
        />
      </Modal>
    </>
  );
};

export default CurlModal;
