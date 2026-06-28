import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import App from './App.vue'
import router from './router'
import './styles/global.scss'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { size: 'default' })
app.mount('#app')
