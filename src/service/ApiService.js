import axios from "axios";
import CryptoJS from "crypto-js";

export default class ApiService {
  static BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";
  static ENCRYPTION_KEY = "thooni-dev-inventory";

  //encrypt data using cryptoJs
  static encrypt(data) {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY.toString());
  }

  //decrypt data using cryptoJs
  static decrypt(data) {
    const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  //save token with encryption
  static saveToken(token) {
    const encryptedToken = this.encrypt(token);
    localStorage.setItem("token", encryptedToken);
  }

  // retreive the token
  static getToken() {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;
    return this.decrypt(encryptedToken);
  }

  //save Role with encryption
  static saveRole(role) {
    const encryptedRole = this.encrypt(role);
    localStorage.setItem("role", encryptedRole);
  }

  static saveOrganization(organization) {
    if (!organization) return;
    const encryptedOrganization = this.encrypt(JSON.stringify(organization));
    localStorage.setItem("organization", encryptedOrganization);
  }

  // retreive the role
  static getRole() {
    const encryptedRole = localStorage.getItem("role");
    if (!encryptedRole) return null;
    return this.decrypt(encryptedRole);
  }

  static getOrganization() {
    const encryptedOrganization = localStorage.getItem("organization");
    if (!encryptedOrganization) return null;
    try {
      return JSON.parse(this.decrypt(encryptedOrganization));
    } catch {
      return null;
    }
  }

  static clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("organization");
  }

  static getHeader() {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**  AUTH && USERS API */

  static async registerUser(registerData) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/register`,
      registerData
    );
    return response.data;
  }

  static async registerOrganization(registerData) {
    const response = await axios.post(
      `${this.BASE_URL}/organizations/register`,
      registerData
    );
    return response.data;
  }

  static async loginUser(loginData) {
    const response = await axios.post(`${this.BASE_URL}/auth/login`, loginData);
    return response.data;
  }

  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/users/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getLoggedInUsesInfo() {
    const response = await axios.get(`${this.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getUserById(userId) {
    const response = await axios.get(`${this.BASE_URL}/users/${userId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateUser(userId, userData) {
    const response = await axios.put(
      `${this.BASE_URL}/users/update/${userId}`,
      userData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteUser(userId) {
    const response = await axios.delete(
      `${this.BASE_URL}/users/delete/${userId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**ORGANIZATION ENDPOINTS */
  static async getCurrentOrganization() {
    const response = await axios.get(`${this.BASE_URL}/organizations/me`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateCurrentOrganization(organizationData) {
    const response = await axios.put(
      `${this.BASE_URL}/organizations/update`,
      organizationData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getCurrentOrganizationUsers() {
    const response = await axios.get(`${this.BASE_URL}/organizations/users`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /**BILLING / PLAN ENDPOINTS */
  static async createPlanCheckout(targetPlan) {
    const response = await axios.post(
      `${this.BASE_URL}/billing/checkout`,
      { targetPlan },
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async confirmPlanPayment(paymentId) {
    const response = await axios.post(
      `${this.BASE_URL}/billing/payments/${paymentId}/confirm`,
      {},
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async cancelPlanPayment(paymentId) {
    const response = await axios.post(
      `${this.BASE_URL}/billing/payments/${paymentId}/cancel`,
      {},
      { headers: this.getHeader() }
    );
    return response.data;
  }

  static async getPlanPayments() {
    const response = await axios.get(`${this.BASE_URL}/billing/payments`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /**PRODUCT ENDPOINTS */

  static async addProduct(formData) {
    const response = await axios.post(
      `${this.BASE_URL}/products/add`,
      formData,
      {
        headers: {
          ...this.getHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  static async updateProduct(formData) {
    const response = await axios.put(
      `${this.BASE_URL}/products/update`,
      formData,
      {
        headers: {
          ...this.getHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  static async getAllProducts() {
    const response = await axios.get(`${this.BASE_URL}/products/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getProductById(productId) {
    const response = await axios.get(`${this.BASE_URL}/products/${productId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async searchProduct(searchValue) {
    const response = await axios.get(`${this.BASE_URL}/products/search`, {
      params: { searchValue },
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteProduct(productId) {
    const response = await axios.delete(
      `${this.BASE_URL}/products/delete/${productId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getLowStockProducts() {
    const response = await axios.get(`${this.BASE_URL}/products/low-stock`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getProductAbcAnalysis() {
    const response = await axios.get(`${this.BASE_URL}/products/abc-analysis`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /**LOGISTICS ENDPOINTS */
  static async getLogisticsKpis() {
    const response = await axios.get(`${this.BASE_URL}/logistics/kpi`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getLogisticsAlerts() {
    const response = await axios.get(`${this.BASE_URL}/logistics/alerts`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getReorderSuggestions() {
    const response = await axios.get(
      `${this.BASE_URL}/logistics/reorder-suggestions`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getLogisticsAbcAnalysis() {
    const response = await axios.get(`${this.BASE_URL}/logistics/abc-analysis`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /**REPORTS ENDPOINTS */
  static async downloadReport(reportType, format, filters = {}) {
    const response = await axios.get(
      `${this.BASE_URL}/reports/${reportType}/${format}`,
      {
        headers: this.getHeader(),
        params: filters,
        responseType: "blob",
      }
    );
    return response;
  }

  /**AUDIT ENDPOINTS */
  static async getAuditLogs() {
    const response = await axios.get(`${this.BASE_URL}/audit`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /**CATEGOTY EDNPOINTS */
  static async createCategory(category) {
    const response = await axios.post(
      `${this.BASE_URL}/categories/add`,
      category,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllCategory() {
    const response = await axios.get(`${this.BASE_URL}/categories/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getCategoryById(categoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/categories/${categoryId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async updateCategory(categoryId, categoryData) {
    const response = await axios.put(
      `${this.BASE_URL}/categories/update/${categoryId}`,
      categoryData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteCategory(categoryId) {
    const response = await axios.delete(
      `${this.BASE_URL}/categories/delete/${categoryId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**Supplier EDNPOINTS */
  static async addSupplier(supplierData) {
    const response = await axios.post(
      `${this.BASE_URL}/suppliers/add`,
      supplierData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllSuppliers() {
    const response = await axios.get(`${this.BASE_URL}/suppliers/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getSupplierById(supplierId) {
    const response = await axios.get(
      `${this.BASE_URL}/suppliers/${supplierId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async updateSupplier(supplierId, supplierData) {
    const response = await axios.put(
      `${this.BASE_URL}/suppliers/update/${supplierId}`,
      supplierData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteSupplier(supplierId) {
    const response = await axios.delete(
      `${this.BASE_URL}/suppliers/delete/${supplierId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**Customer EDNPOINTS */
  static async addCustomer(customerData) {
    const response = await axios.post(
      `${this.BASE_URL}/customers/add`,
      customerData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllCustomers() {
    const response = await axios.get(`${this.BASE_URL}/customers/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getCustomerById(customerId) {
    const response = await axios.get(
      `${this.BASE_URL}/customers/${customerId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async updateCustomer(customerId, customerData) {
    const response = await axios.put(
      `${this.BASE_URL}/customers/update/${customerId}`,
      customerData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteCustomer(customerId) {
    const response = await axios.delete(
      `${this.BASE_URL}/customers/delete/${customerId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**Transactions EDNPOINTS */
  static async purchaseProduct(body) {
    const response = await axios.post(
      `${this.BASE_URL}/transactions/purchase`,
      body,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async sellProduct(body) {
    const response = await axios.post(
      `${this.BASE_URL}/transactions/sell`,
      body,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async returnToSupplier(body) {
    const response = await axios.post(
      `${this.BASE_URL}/transactions/return`,
      body,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async returnFromCustomer(body) {
    const response = await axios.post(
      `${this.BASE_URL}/transactions/customer-return`,
      body,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllTransactions(filter) {
    const response = await axios.get(`${this.BASE_URL}/transactions/all`, {
      headers: this.getHeader(),
      params: { filter },
    });
    return response.data;
  }

  static async geTransactionsByMonthAndYear(month, year) {
    const response = await axios.get(
      `${this.BASE_URL}/transactions/by-month-year`,
      {
        headers: this.getHeader(),
        params: {
          month: month,
          year: year,
        },
      }
    );
    return response.data;
  }

  static async getTransactionById(transactionId) {
    const response = await axios.get(
      `${this.BASE_URL}/transactions/${transactionId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async updateTransactionStatus(transactionId, status) {
    const response = await axios.put(
      `${this.BASE_URL}/transactions/${transactionId}`,
      status,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**NOTIFICATIONS ENDPOINTS */
  static async getNotifications() {
    const response = await axios.get(`${this.BASE_URL}/notifications`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async markNotificationAsRead(notificationId) {
    const response = await axios.put(
      `${this.BASE_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async markAllNotificationsAsRead() {
    const response = await axios.put(
      `${this.BASE_URL}/notifications/read-all`,
      {},
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**WAREHOUSES / QUALITY / PRODUCTION */
  static async getWarehouses() {
    const response = await axios.get(`${this.BASE_URL}/warehouses`, { headers: this.getHeader() });
    return response.data;
  }

  static async createWarehouse(data) {
    const response = await axios.post(`${this.BASE_URL}/warehouses`, data, { headers: this.getHeader() });
    return response.data;
  }

  static async updateWarehouse(id, data) {
    const response = await axios.put(`${this.BASE_URL}/warehouses/${id}`, data, { headers: this.getHeader() });
    return response.data;
  }

  static async deleteWarehouse(id) {
    const response = await axios.delete(`${this.BASE_URL}/warehouses/${id}`, { headers: this.getHeader() });
    return response.data;
  }

  static async getQualityRecords() {
    const response = await axios.get(`${this.BASE_URL}/quality-records`, { headers: this.getHeader() });
    return response.data;
  }

  static async createQualityRecord(data) {
    const response = await axios.post(`${this.BASE_URL}/quality-records`, data, { headers: this.getHeader() });
    return response.data;
  }

  static async updateQualityRecord(id, data) {
    const response = await axios.put(`${this.BASE_URL}/quality-records/${id}`, data, { headers: this.getHeader() });
    return response.data;
  }

  static async deleteQualityRecord(id) {
    const response = await axios.delete(`${this.BASE_URL}/quality-records/${id}`, { headers: this.getHeader() });
    return response.data;
  }

  static async getProductionOrders() {
    const response = await axios.get(`${this.BASE_URL}/production-orders`, { headers: this.getHeader() });
    return response.data;
  }

  static async createProductionOrder(data) {
    const response = await axios.post(`${this.BASE_URL}/production-orders`, data, { headers: this.getHeader() });
    return response.data;
  }

  static async updateProductionOrder(id, data) {
    const response = await axios.put(`${this.BASE_URL}/production-orders/${id}`, data, { headers: this.getHeader() });
    return response.data;
  }

  static async deleteProductionOrder(id) {
    const response = await axios.delete(`${this.BASE_URL}/production-orders/${id}`, { headers: this.getHeader() });
    return response.data;
  }

  /**AUTHENTICATION CHECKER */
  static logout() {
    this.clearAuth();
  }

  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  static isAdmin() {
    const role = this.getRole();
    return role === "ADMIN";
  }

  static isManager() {
    const role = this.getRole();
    return role === "MANAGER";
  }

  static isViewer() {
    const role = this.getRole();
    return role === "VIEWER";
  }
}

