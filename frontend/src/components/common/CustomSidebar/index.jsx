import React, { useState, useEffect } from "react";
import { Layout, Menu, Input, Dropdown, Col, Row } from "antd";
import { SearchOutlined, PlusCircleTwoTone } from "@ant-design/icons";

const { Sider } = Layout;

const CustomSidebar = (props) => {
  // hooks
  const [state, setState] = useState({
    searchItems: [],
    menuItems: [],
    editedItemId: "",
    editedItemText: "",
    optionsAdd: null,
    itemsOptions: [],
    headerExtraRow: null,
  });

  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [activeKey, setActiveKey] = useState("");

  const mount = () => {
    if (props.data && Array.isArray(props.data)) {
      const items = getMenuItems();
      const optionsAdd = getAddOptions();

      setState((prevState) => ({
        ...prevState,
        menuItems: items,
        searchItems: items,
        optionsAdd: optionsAdd,
        headerExtraRow: props.headerExtraRow ?? null,
      }));
    }
  };
  useEffect(mount, [props.data, props.headerExtraRow]);

  // handlers
  const handleSearch = (value) => {
    if (value === "") {
      setState((prevState) => ({ ...prevState, searchItems: state.menuItems }));
      return;
    }

    const filterItems = state.menuItems.filter((item) => {
      return item.name.toLowerCase().includes(value.toLowerCase());
    });

    setState((prevState) => ({ ...prevState, searchItems: filterItems }));
  };

  // functions
  function getAddOptions() {
    if (!props.addOptions) return null;
    const optionsAdd = props.addOptions.map((value, index) => {
      return {
        key: index,
        label: <div onClick={value.onClick}>{value.label}</div>,
      };
    });

    return optionsAdd;
  }

  function getOptionsItems(value, parentIndex) {
    if (!props.itemsOptions) return null;
    const itemsOptions = props.itemsOptions.map((option, indexop) => {
      const keyOption = `${parentIndex}-${indexop}`;
      return {
        key: keyOption,
        label: (
          <div
            key={keyOption}
            onClick={(e) => {
              option.onClick(value);
              e.stopPropagation();
              setOpenKeys([]);
            }}
          >
            {option.label}
          </div>
        ),
      };
    });

    return itemsOptions;
  }

  function getMenuItems() {
    if (!props.data) return null;
    const items = props.data.map((value, indexda) => {
      return {
        key: value.id,
        name: value.name,
        theme: "light",
        label: (
          <div
            id={value.id}
            name={value.name}
            onClick={(e) => {
              setActiveKey(value.id);
              setSelectedKeys([value.id]);
              setOpenKeys([]);
              props.onSelect({
                key: value.id,
              });
              e.stopPropagation();
            }}
          >
            {value.name}
          </div>
        ),
        children: getOptionsItems(value, indexda),
      };
    });

    return items;
  }

  return (
    <Sider style={{ height: "100%", maxWidth: "fit-content"}}>
      <Row>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fff",
            padding: "12px 16px",
          }}
        >
          {!state.optionsAdd ? (
            <div>{props.title}</div>
          ) : (
            <>
              {props.title}
              <Dropdown menu={{ items: state.optionsAdd }} trigger={["click"]}>
                <PlusCircleTwoTone />
              </Dropdown>
            </>
          )}
        </div>
      </Row>

      {
        state.headerExtraRow ? (
            state.headerExtraRow
        ) : <></>
      }

      {props.searchMode ? (
        <Row>
          <Input
            placeholder="Buscar"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Row>
      ) :  <></>
      }
        <Menu
          theme="dark"
          className="menu"
          mode="vertical"
          triggerSubMenuAction={"click"}
          items={state.searchItems}
          selectedKeys={selectedKeys}
          onSelect={(menuOptions) => {
            if (menuOptions.keyPath.length == 1) {
              setSelectedKeys(menuOptions.key);
              setActiveKey(menuOptions.key);
              props.onSelect(menuOptions);
              return;
            }
            setOpenKeys([]);
            const key = menuOptions.keyPath[menuOptions.keyPath.length - 1];
            setSelectedKeys([key]);
            setActiveKey(key);
          }}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          activeKey={activeKey}
        ></Menu>
    </Sider>
  );
};

export default CustomSidebar;
