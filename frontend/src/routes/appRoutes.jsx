import {
  HomeView,
  OperationSchemaView,
  RelationOperationView,
  ProcessView
} from '../views';

import {
UserOutlined,
LaptopOutlined,
NotificationOutlined,
ContainerOutlined,
} from "@ant-design/icons";

export const AppRoutes = [
  {
    path: "/",
    component: HomeView,
    title: "Home",
    children: [],
  },
  {
    // first route of array is a principal in sidebar menu
    path: ["/operation_schemas", "/operation_schemas/:mode", "/operation_schemas/:mode/:id"],
    component: OperationSchemaView,
    title: "Operation Schemas",
    icon: <UserOutlined/>,
    children: [],
  },
  {
    path: "/operation_templates",
    component: RelationOperationView,
    title: "Operation Templates",
    icon: <LaptopOutlined/>,
    children: [],
  },
  {
    path: "/flow",
    component: RelationOperationView,
    title: "Flow",
    icon: <NotificationOutlined/>,
    children: [],
  },
  {
    path: "/process",
    component: ProcessView,
    title: "Process",
    icon: <ContainerOutlined/>,
    children: [],
  },
];