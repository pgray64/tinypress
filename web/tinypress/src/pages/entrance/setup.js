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
import { Divider } from "@mui/material";

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
    imageDirectoryPath: [
      {
        required: true,
        message: "Enter the local directory path for image storage",
      },
      {
        maxLength: 255,
        message: "Max length is 255",
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
    smtpServer: [
      { required: true, message: "Enter an SMTP server URL" },
      {
        maxLength: 255,
        message: "Max length is 255",
      },
    ],
    smtpUsername: [
      { required: true, message: "Enter an SMTP username" },
      {
        maxLength: 255,
        message: "Max length is 255",
      },
    ],
    smtpPassword: [
      { required: true, message: "Enter an SMTP password" },
      {
        maxLength: 255,
        message: "Max length is 255",
      },
    ],
    smtpPort: [
      { required: true, message: "Enter an SMTP port" },
      {
        maxLength: 255,
        message: "Max length is 255",
      },
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
      imageDirectoryPath: data.get("imageDirectoryPath"),
      username: data.get("username"),
      email: data.get("email"),
      password: data.get("password"),
      smtpServer: data.get("smtpServer"),
      smtpUsername: data.get("smtpUsername"),
      smtpPassword: data.get("smtpPassword"),
      smtpPort: data.get("smtpPort"),
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
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
            noValidate
          >
            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Settings
              </Typography>
            </Divider>
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
              <Grid item xs={12}>
                <TextField
                  type="text"
                  required
                  fullWidth
                  id="imageDirectoryPath"
                  label="Image Directory Path"
                  name="imageDirectoryPath"
                  autoComplete="off"
                  helperText={
                    errors.imageDirectoryPath ?? "e.g. /data/my-image-storage"
                  }
                  error={errors.imageDirectoryPath}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                New user
              </Typography>
            </Divider>
            <Grid container spacing={2}>
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
            <Divider sx={{ mt: 2, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Email delivery
              </Typography>
            </Divider>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These settings allow your website to send emails for purposes
                such as password recovery, inviting new users, and security
                alerts. There are many free options for SMTP providers, such as
                Gmail, Sendgrid, and Mailgun.
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  type="text"
                  required
                  fullWidth
                  id="smtpServer"
                  label="SMTP Server"
                  name="smtpServer"
                  autoComplete="off"
                  helperText={errors.smtpServer}
                  error={errors.smtpServer}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  type="text"
                  required
                  fullWidth
                  id="smtpPort"
                  label="SMTP Port"
                  name="smtpPort"
                  autoComplete="off"
                  helperText={errors.smtpPort}
                  error={errors.smtpPort}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  required
                  fullWidth
                  id="smtpUsername"
                  label="SMTP Username"
                  name="smtpUsername"
                  autoComplete="off"
                  helperText={errors.smtpUsername}
                  error={errors.smtpUsername}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  required
                  fullWidth
                  id="smtpPassword"
                  label="SMTP Password"
                  name="smtpPassword"
                  autoComplete="off"
                  helperText={errors.smtpPassword}
                  error={errors.smtpPassword}
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
