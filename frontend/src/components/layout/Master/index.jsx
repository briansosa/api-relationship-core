import React from "react";
import SectionFooter from "../SectionFooter";
import SectionHeader from "../SectionHeader";
import SectionSidebar from "../SectionSidebar";
import { Col, Layout, Row } from "antd";

const { Content } = Layout;

const Master = (props) => {
  return (
    <Layout>
      <Layout className="site-layout">
        {/* <SectionHeader></SectionHeader> */}
          <Layout>
            <SectionSidebar></SectionSidebar>
            <Content style={{ height: "97vh" }}>{props.component()}</Content>
          </Layout>
          <SectionFooter></SectionFooter>
      </Layout>
    </Layout>
  );
};

export default Master;
