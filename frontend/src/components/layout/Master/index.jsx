import React from "react";
import SectionFooter from "../SectionFooter";
import SectionHeader from "../SectionHeader";
import SectionSidebar from "../SectionSidebar";
import { Col, Layout, Row } from "antd";

const { Content } = Layout;

const Master = ({ component: Component }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout className="site-layout">
        {/* <SectionHeader></SectionHeader> */}
        <Layout>
          <SectionSidebar></SectionSidebar>
          <Content style={{ height: "calc(100vh - 30px)", overflow: "auto" }}>
            <Component />
          </Content>
        </Layout>
        <SectionFooter style={{ position: "fixed", bottom: 0, width: "100%" }} />
      </Layout>
    </Layout>
  );
};

export default Master;
