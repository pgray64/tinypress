/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import logoImage from "../../logo.svg";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
export default function TinypressLogo({ height }) {
  return (
    <Link to="/dashboard" component={RouterLink} sx={{ display: "flex" }}>
      <img src={logoImage} height={height} alt="Tinypress" />
    </Link>
  );
}
