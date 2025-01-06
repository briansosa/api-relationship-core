import "./styles/App.css";
import "./styles/global.less";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import Router from "./Router";
import { TemplateFieldsProvider } from './context/TemplateFieldsContext';
import { FlowProvider } from './context/FlowContext';

function App() {
  return (
    <FlowProvider>
      <TemplateFieldsProvider>
        <ConfigProvider
          theme={{
            algorithm: theme.compactAlgorithm,
          }}
        >
          <Router></Router>
        </ConfigProvider>
      </TemplateFieldsProvider>
    </FlowProvider>
  );
}

export default App;
