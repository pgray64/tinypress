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
import { validateFormData } from "../../helpers/validation/validateFormData";

const theme = createTheme();

export default function Setup() {
  let navigate = useNavigate();
  const [serverError, setServerError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const validationRules = {
    websiteName: [
      { required: true, message: "Enter a website name" },
      {
        maxLength: 100,
        message: "Max length is 100",
      },
    ],
    displayName: [
      { required: true, message: "Enter a display name" },
      {
        maxLength: 100,
        message: "Max length is 100",
      },
    ],
    username: [
      { required: true, message: "Enter a username name" },
      {
        pattern: "[a-zA-Z0-9]+",
        message: "Username can only contain letters and numbers",
      },
      {
        maxLength: 100,
        message: "Max length is 100",
      },
    ],
    email: [
      { required: true, message: "Enter an email address" },
      { email: true, message: "Email address is invalid" },
      {
        maxLength: 255,
        message: "Max length is 255",
      },
    ],
    password: [
      { required: true, message: "Enter a password" },
      { minLength: 8, message: "Password should be at least 8 characters" },
    ],
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
    setup({
      siteName: data.get("websiteName"),
      displayName: data.get("displayName"),
      username: data.get("username"),
      email: data.get("email"),
      password: data.get("password"),
    }).then(
      () => {
        // navigate("/dashboard", { replace: true });
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
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
            noValidate
          >
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
                  helperText={errors.websiteName}
                  error={errors.websiteName}
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
                  helperText={errors.displayName}
                  error={errors.displayName}
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
                  helperText={errors.username}
                  error={errors.username}
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
                  helperText={errors.email}
                  error={errors.email}
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
                  helperText={errors.password}
                  error={errors.password}
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
