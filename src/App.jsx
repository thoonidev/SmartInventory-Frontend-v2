import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute, ManagerRoute, PlanFeatureRoute } from "./service/Guard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import PublicAppsPage from "./pages/PublicAppsPage";
import PublicPricingPage from "./pages/PublicPricingPage";
import PublicCompanyPage from "./pages/PublicCompanyPage";
import CategoryPage from "./pages/CategoryPage";
import SupplierPage from "./pages/SupplierPage";
import AddEditSupplierPage from "./pages/AddEditSupplierPage";
import CustomerPage from "./pages/CustomerPage";
import AddEditCustomerPage from "./pages/AddEditCustomerPage";
import ProductPage from "./pages/ProductPage";
import AddEditProductPage from "./pages/AddEditProductPage";
import PurchasePage from "./pages/PurchasePage";
import SellPage from "./pages/SellPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ReturnToSupplierPage from "./pages/ReturnToSupplierPage";
import ReturnFromCustomerPage from "./pages/ReturnFromCustomerPage";
import LogisticsPage from "./pages/LogisticsPage";
import ReportsPage from "./pages/ReportsPage";
import AuditPage from "./pages/AuditPage";
import OrganizationPage from "./pages/OrganizationPage";
import LiveOperationsPage from "./pages/LiveOperationsPage";
import PlanPage from "./pages/PlanPage";
import NotificationsPage from "./pages/NotificationsPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import WarehousePage from "./pages/WarehousePage";
import QualityPage from "./pages/QualityPage";
import ProductionPage from "./pages/ProductionPage";
import { ConfirmProvider } from "./component/ConfirmDialog";

function App() {
  return (
    <ConfirmProvider>
      <Router>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apps" element={<PublicAppsPage />} />
        <Route path="/pricing" element={<PublicPricingPage />} />
        <Route path="/company" element={<PublicCompanyPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/category"
          element={<AdminRoute element={<CategoryPage />} />}
        />
        <Route
          path="/supplier"
          element={<AdminRoute element={<SupplierPage />} />}
        />
        <Route
          path="/customer"
          element={<AdminRoute element={<CustomerPage />} />}
        />
        <Route
          path="/add-customer"
          element={<AdminRoute element={<AddEditCustomerPage />} />}
        />
        <Route
          path="/edit-customer/:customerId"
          element={<AdminRoute element={<AddEditCustomerPage />} />}
        />
        <Route
          path="/add-supplier"
          element={<AdminRoute element={<AddEditSupplierPage />} />}
        />
        <Route
          path="/edit-supplier/:supplierId"
          element={<AdminRoute element={<AddEditSupplierPage />} />}
        />
        <Route
          path="/product"
          element={<AdminRoute element={<ProductPage />} />}
        />

        <Route
          path="/add-product"
          element={<AdminRoute element={<AddEditProductPage />} />}
        />
        <Route
          path="/edit-product/:productId"
          element={<AdminRoute element={<AddEditProductPage />} />}
        />

        {/* ADMIN AND MANAGERS ROUTES */}
        <Route
          path="/purchase"
          element={<ManagerRoute element={<PurchasePage />} />}
        />
        <Route
          path="/sell"
          element={<ManagerRoute element={<SellPage />} />}
        />

        <Route
          path="/return-to-supplier"
          element={<ManagerRoute element={<ReturnToSupplierPage />} />}
        />
        <Route
          path="/return-from-customer"
          element={<ManagerRoute element={<ReturnFromCustomerPage />} />}
        />

        <Route
          path="/transaction"
          element={<ProtectedRoute element={<TransactionsPage />} />}
        />
        <Route
          path="/transaction/:transactionId"
          element={<ProtectedRoute element={<TransactionDetailsPage />} />}
        />

        <Route
          path="/profile"
          element={<ProtectedRoute element={<ProfilePage />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage />} />}
        />
        <Route
          path="/logistics"
          element={<ProtectedRoute element={<LogisticsPage />} />}
        />
        <Route
          path="/reports"
          element={<PlanFeatureRoute feature="reports" element={<ReportsPage />} />}
        />
        <Route
          path="/live"
          element={<PlanFeatureRoute feature="live" element={<LiveOperationsPage />} />}
        />
        <Route
          path="/notifications"
          element={<ProtectedRoute element={<NotificationsPage />} />}
        />
        <Route
          path="/warehouses"
          element={<ProtectedRoute element={<WarehousePage />} />}
        />
        <Route
          path="/quality"
          element={<ProtectedRoute element={<QualityPage />} />}
        />
        <Route
          path="/production"
          element={<ProtectedRoute element={<ProductionPage />} />}
        />
        <Route
          path="/approvals"
          element={<ManagerRoute element={<ApprovalsPage />} />}
        />
        <Route
          path="/audit"
          element={<AdminRoute element={<PlanFeatureRoute feature="audit" element={<AuditPage />} />} />}
        />
        <Route
          path="/organization"
          element={<AdminRoute element={<OrganizationPage />} />}
        />
        <Route
          path="/plan"
          element={<AdminRoute element={<PlanPage />} />}
        />

        <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </ConfirmProvider>
  );
}

export default App;
