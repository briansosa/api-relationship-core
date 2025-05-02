import React from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import './styles/style.css'
import './styles/global.less'
import { ConfigProvider } from 'antd';

import App from './App'

// Agregar la clase "light" al elemento html para activar el tema claro de Tailwind
document.documentElement.classList.add('light');

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <ConfigProvider>
            <App/>
        </ConfigProvider>
    </React.StrictMode>
)
