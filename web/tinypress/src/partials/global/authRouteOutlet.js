/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { session } from "../../services/api/account/session";
import { Backdrop, CircularProgress } from "@mui/material";
import AuthContext from "../../contexts/authContext";

export function AuthRouteOutlet() {
  let [loading, setLoading] = React.useState(true);
  let [user, setUser] = React.useState({});

  let location = useLocation();

  const canAccessFeature = (feature) => {
    if (!user?.allowedFeatures || user.allowedFeatures.length < 1) {
      return false;
    }
    return user.allowedFeatures.indexOf(feature) >= 0;
  };

  React.useEffect(() => {
    (async function () {
      let result;
      try {
        result = await session();
        setUser(result.data);
        setLoading(false);
      } catch (e) {
        setUser(null);
        setLoading(false);
      }
    })();
  }, [location]);

  if (loading) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
  if (!user?.userId) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  return (
    <AuthContext.Provider value={{ user, canAccessFeature }}>
      <Outlet />
    </AuthContext.Provider>
  );
}
