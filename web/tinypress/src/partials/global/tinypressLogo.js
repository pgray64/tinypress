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
