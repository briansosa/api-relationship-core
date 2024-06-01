import { useState, useEffect } from "react";
import { Layout, Menu, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../../../routes/appRoutes";

import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import Logo from "../../../assets/images/logo-detective.svg";

const { Sider } = Layout;

const SectionSidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const sidebarItems = AppRoutes.map((route, index) => {
    if (index == 0) return;

    let path = route.path;

    if (Array.isArray(path)) {
      path = path[0];
    }

    return {
      label: route.title,
      key: path,
      icon: route.icon,
    };
  });

  const mount = () => {
    if (window.location.pathname == "/") {
      setCollapsed(true);
    }
  };
  useEffect(mount, []);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      // width={200}
      breakpoint="xxl"
      collapsedWidth={"50px"}
    >
      <div>
        <img
          style={{ width: "80%", marginTop: 20, backgroundColor: "#08c" }}
          src={Logo}
          alt="Logo"
          onClick={() => {
            setCollapsed(false);
            navigate("/");
          }}
        />
      </div>
      <div className="logo" />

      <Menu
        items={sidebarItems}
        onClick={({ key }) => {
          navigate(key);
          setCollapsed(true);
        }}
        selectedKeys={window.location.pathname}
        mode="inline"
        className="menu"
        theme="dark"
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          margin: 10,
        }}
      >
        <Button
          type="text"
          icon={
            collapsed ? (
              <MenuUnfoldOutlined style={{ color: "#08c" }} />
            ) : (
              <MenuFoldOutlined style={{ color: "#08c" }} />
            )
          }
          onClick={toggleCollapsed}
        ></Button>
      </div>
    </Sider>
  );
};

export default SectionSidebar;
