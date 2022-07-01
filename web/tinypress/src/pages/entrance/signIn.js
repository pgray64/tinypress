/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { signIn } from "../../services/api/entrance/authentication";
import CustomSnackbar from "../../partials/global/customSnackbar";
import TinypressLogo from "../../partials/global/tinypressLogo";
import Footer from "../../partials/global/footer";
import { validateFormData } from "../../helpers/validation/validateFormData";

const theme = createTheme();

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const validationRules = {
    username: [{ required: true, message: "Enter a username" }],
    password: [{ required: true, message: "Enter a password" }],
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const validationErrors = validateFormData(data, validationRules);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    signIn({
      username: data.get("username"),
      password: data.get("password"),
    }).then(
      () => {
        navigate(location.state?.from ?? "/dashboard", { replace: true });
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
            Sign in
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              type="text"
              helperText={errors.username}
              error={errors.username}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              helperText={errors.password}
              error={errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={submitting}
            >
              Sign In
            </Button>
            <Box>
              <Link
                to="/forgot-password"
                variant="body2"
                component={RouterLink}
              >
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Box>
        <Footer sx={{ mt: 8, mb: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
