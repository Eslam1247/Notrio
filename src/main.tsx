import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { StockProvider } from './context/StockContext'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './i18n'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><LanguageProvider><AuthProvider><StockProvider><CartProvider><App /></CartProvider></StockProvider></AuthProvider></LanguageProvider></BrowserRouter></React.StrictMode>
)
