import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal'

OneSignal.init({
  appId: '49f1f9f9-b16a-46e7-b8b8-3c6a28d166d6',
  allowLocalhostAsSecureOrigin: true,
  notifyButton: {
    enable: true,
  },
  promptOptions: {
    slidedown: {
      enabled: true,
      autoPrompt: true,
      timeDelay: 3,
      pageViews: 1,
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)