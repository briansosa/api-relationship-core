import HomeView from "./HomeView";
import OperationSchemaView from "./OperationSchemaView";
import OperationTemplateView from "./OperationTemplateView";
import ProcessView from "./ProcessView";
import FlowView from "./FlowView";
import ProcessResultView from "./ProcessResultView";
import OperationsApp from '../../src/app/page';

// Creamos un componente React adecuado para exportar OperationsApp
const Page = () => {
  return <OperationsApp />;
};

export {
    HomeView,
    OperationSchemaView,
    OperationTemplateView,
    ProcessView,
    FlowView,
    ProcessResultView,
    Page
};