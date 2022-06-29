import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { setup } from "../../services/api/entrance/setup";
import CustomSnackbar from "../../partials/global/customSnackbar";
import { useNavigate } from "react-router-dom";
import Footer from "../../partials/global/footer";
import TinypressLogo from "../../partials/global/tinypressLogo";

const theme = createTheme();

export default function Setup() {
  let navigate = useNavigate();
  const [serverError, setServerError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setup({
      siteName: data.get("websiteName"),
      displayName: data.get("displayName"),
      username: data.get("username"),
      email: data.get("email"),
      password: data.get("password"),
    }).then(
      () => {
        navigate("/dashboard", { replace: true });
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setSubmitting(false);
      }
    );
  };
  const closeSnackbars = () => {
    setServerError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <CustomSnackbar
          message={serverError}
          severity="error"
          open={serverError}
          onClose={closeSnackbars}
        />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography>
            <TinypressLogo height={30} />
          </Typography>

          <Typography component="h2" variant="h5" sx={{ mt: 3 }}>
            Your website is almost ready!
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  required
                  fullWidth
                  id="websiteName"
                  label="Website Name"
                  name="websiteName"
                  autoComplete="off"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="off"
                  name="displayName"
                  required
                  fullWidth
                  id="displayName"
                  label="Display Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="off"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="email"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  inputProps={{ minLength: 10 }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={submitting}
            >
              Continue
            </Button>
          </Box>
        </Box>
        <Footer sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
