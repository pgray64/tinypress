/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from "react";
import AuthContext from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";

export default function CheckFeatureAccess({ feature }) {
  const authContext = React.useContext(AuthContext);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!authContext.canAccessFeature(feature)) {
      navigate("/dashboard", { replace: true });
    }
  }, []);
}