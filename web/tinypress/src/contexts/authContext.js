import * as React from "react";

const AuthContext = React.createContext({
  user: null,
  canAccessFeature: () => {},
});

export default AuthContext;
