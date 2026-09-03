import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://886f8c9aa1c0f0605063c63c489de415@o4512024240390144.ingest.de.sentry.io/4512024265424976',
  environment: import.meta.env.MODE,
  tracesSampleRate: 0,
})

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