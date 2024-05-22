import React from 'react'
import {createRoot} from 'react-dom/client'
import './styles/style.css'
import './styles/global.less'
import { ConfigProvider } from 'antd';

import App from './App'

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <ConfigProvider>
            <App/>
        </ConfigProvider>
    </React.StrictMode>
)
