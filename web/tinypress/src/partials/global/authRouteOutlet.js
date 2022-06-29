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
