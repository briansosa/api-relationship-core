import React from "react";
import SectionFooter from "../SectionFooter";
import SectionHeader from "../SectionHeader";
import SectionSidebar from "../SectionSidebar";
import { Col, Layout, Row } from "antd";

const { Content } = Layout;

const Master = (props) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout className="site-layout">
        <SectionHeader></SectionHeader>
        <Layout>
          <SectionSidebar></SectionSidebar>
          <Content style={{ height: "100%" }}>{props.component()}</Content>
        </Layout>
        <SectionFooter></SectionFooter>
      </Layout>
    </Layout>
  );
};

export default Master;
