import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import {
  GoogleOAuthProvider
} from '@react-oauth/google'
//google oauth provider for login
ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <GoogleOAuthProvider
    clientId="789045532315-mgs4nquhmvffkfmpj4ac0h7gu583v728.apps.googleusercontent.com"
  >
    <App />
  </GoogleOAuthProvider>
)