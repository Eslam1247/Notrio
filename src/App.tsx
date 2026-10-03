import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import Story from './pages/Story'
import Track from './pages/Track'
import Returns from './pages/Returns'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => window.scrollTo(0, 0), [pathname]); return null }

export default function App() {
  const isAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <>
      <ScrollTop />{!isAdmin && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:world" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/story" element={<Story />} />
        <Route path="/track" element={<Track />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <><Footer /><CartDrawer /></>}
    </>
  )
}
