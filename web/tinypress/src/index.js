/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthRouteOutlet } from "./partials/global/authRouteOutlet";
import Setup from "./pages/entrance/setup";
import DashboardHome from "./pages/account/dashboardHome";
import SignIn from "./pages/entrance/signIn";
import ManageUsers from "./pages/admin/manageUsers";
import AddUser from "./pages/admin/addUser";
import EditUser from "./pages/admin/editUser";
import SiteSettings from "./pages/admin/siteSettings";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="setup" element={<Setup />} />
        <Route path="sign-in" element={<SignIn />} />

        {/* Authenticated routes here */}
        <Route element={<AuthRouteOutlet />}>
          <Route path="dashboard" element={<DashboardHome />} />
          {/* Admin routes */}
          <Route path="admin/manage-users" element={<ManageUsers />} />
          <Route path="admin/manage-users/add" element={<AddUser />} />
          <Route path="admin/manage-users/edit/:id" element={<EditUser />} />
          <Route path="admin/site-settings" element={<SiteSettings />} />
        </Route>

        {/* Catch-all to redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
