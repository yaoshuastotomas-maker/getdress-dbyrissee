/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Customer Components & Pages
import { CustomerLayout } from './components/customer/CustomerLayout';
import { HomePage } from './pages/customer/HomePage';
import { CatalogPage } from './pages/customer/CatalogPage';
import { DressDetailPage } from './pages/customer/DressDetailPage';
import { AboutPage } from './pages/customer/AboutPage';
import { ContactPage } from './pages/customer/ContactPage';
import { PaymentPage } from './pages/customer/PaymentPage';
import { PrivacyPolicyPage } from './pages/customer/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/customer/TermsOfServicePage';

// Admin Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminDressesPage } from './pages/admin/AdminDressesPage';
import { AdminDressFormPage } from './pages/admin/AdminDressFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer Facing Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="dresses" element={<CatalogPage />} />
                <Route path="dresses/:slug" element={<DressDetailPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="payment" element={<PaymentPage />} />
                <Route path="privacy" element={<PrivacyPolicyPage />} />
                <Route path="terms" element={<TermsOfServicePage />} />
                <Route path="catalog" element={<Navigate to="/dresses" replace />} />
              </Route>

              {/* Owner / Admin Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Owner / Admin Management Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="dresses" element={<AdminDressesPage />} />
                <Route path="dresses/new" element={<AdminDressFormPage />} />
                <Route path="dresses/:id/edit" element={<AdminDressFormPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="inquiries" element={<AdminInquiriesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="history" element={<AdminHistoryPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

