import { Spin } from "antd";
import "./index.css";

const Loading = (props) => {
  return (
    <Spin
      spinning={props.visible}
      fullscreen={props.fullscreen}
      className={
        !props.fullscreen && props.content && props.visible
          ? "content-style"
          : ""
      }
    ></Spin>
  );
};

export default Loading;
