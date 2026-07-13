import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AddProduct from '../pages/admin/AddProduct';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageProducts from '../pages/admin/ManageProducts';
import ManageCategories from '../pages/admin/ManageCategories';
import ManageUsers from '../pages/admin/ManageUsers';
import Orders from '../pages/admin/Orders';
import TrackingSettings from '../pages/admin/TrackingSettings';
import About from '../pages/About';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import ClientDashboard from '../pages/ClientDashboard';
import Home from '../pages/Home';
import LoginRegister from '../pages/LoginRegister';
import NotFound from '../pages/NotFound';
import OrderHistory from '../pages/OrderHistory';
import Profile from '../pages/Profile';
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
          <Route path="signup" element={<LoginRegister />} />
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="dashboard/profile" element={<Profile />} />
            <Route path="dashboard/orders" element={<OrderHistory />} />
          </Route>
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/add-product" element={<AddProduct />} />
            <Route path="admin/products" element={<ManageProducts />} />
            <Route path="admin/categories" element={<ManageCategories />} />
            <Route path="admin/orders" element={<Orders />} />
            <Route path="admin/users" element={<ManageUsers />} />
            <Route path="admin/tracking" element={<TrackingSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
