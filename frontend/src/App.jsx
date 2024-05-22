import "./styles/App.css";
import "./styles/global.less";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import Router from "./Router";

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.compactAlgorithm,
      }}
    >
      <Router></Router>
    </ConfigProvider>
  );
}

export default App;
