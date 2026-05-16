import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AddProduct from '../pages/admin/AddProduct';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageProducts from '../pages/admin/ManageProducts';
import Orders from '../pages/admin/Orders';
import About from '../pages/About';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Home from '../pages/Home';
import LoginRegister from '../pages/LoginRegister';
import ProductDetails from '../pages/ProductDetails';
import Products from '../pages/Products';
import { ProtectedRoute } from './ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="about" element={<About />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<LoginRegister />} />
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
          </Route>
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/add-product" element={<AddProduct />} />
            <Route path="admin/products" element={<ManageProducts />} />
            <Route path="admin/orders" element={<Orders />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
