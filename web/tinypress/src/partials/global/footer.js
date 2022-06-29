import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Footer(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      Powered by{" "}
      <Link color="inherit" href="https://tinypress.org">
        Tinypress
      </Link>
    </Typography>
  );
}
