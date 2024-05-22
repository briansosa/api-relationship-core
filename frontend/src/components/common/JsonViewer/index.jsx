import React, { useEffect, useState } from "react";
import { JsonEditor } from "json-edit-react";

const JsonViewer = (props) => {
  //hooks
  const [state, setState] = useState({
    json: {},
    showArrayIndices: false,
    showCollectionCount: "when-closed",
    allowEdit: false,
    allowDelete: false,
    allowAdd: false,
  });

  const mount = () => {
    setState((prevState) => ({
      ...prevState,
      json: props.json ?? {},
      showArrayIndices: props.showArrayIndices,
      showCollectionCount: props.showCollectionCount,
      allowEdit: props.allowEdit,
      allowDelete: props.allowDelete,
      allowAdd: props.allowAdd,
    }));
  };

  useEffect(mount, [props]);

  return (
    <>
      <JsonEditor
        data={state.json}
        rootName={""}
        indent={2}
        confirmGood={false}
        showArrayIndices={state.showArrayIndices}
        showCollectionCount={state.showCollectionCount}
        height="90vh"
        width="100%"
        theme={"githubLight"}
        restrictEdit={!state.allowEdit}
        restrictDelete={!state.allowDelete}
        restrictAdd={!state.allowAdd}
        onUpdate={props.onUpdate}
        onChange={props.onChange}
      />
    </>
  );
};

export default JsonViewer;
