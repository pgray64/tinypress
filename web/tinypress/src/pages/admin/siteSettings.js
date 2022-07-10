/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CustomSnackbar from "../../partials/global/customSnackbar";
import AccountAppBar from "../../partials/account/accountAppBar";
import { CircularProgress, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import CheckFeatureAccess from "../../partials/account/checkFeatureAccess";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import TextField from "@mui/material/TextField";
import { validateFormData } from "../../helpers/validation/validateFormData";
import Button from "@mui/material/Button";
import {
  getSettings,
  updateSettings,
} from "../../services/api/admin/siteSettings";

const theme = createTheme();

export default function SiteSettings() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [settingsData, setSettingsData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState({});

  const validationRules = {
    siteName: [
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

  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const closeSuccessSnackbar = () => {
    setSuccessMessage(null);
  };
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/dashboard", { replace: false });
  };

  React.useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = () => {
    getSettings().then(
      (res) => {
        setSettingsData(res.data ?? {});
        setLoading(false);
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setLoading(false);
      }
    );
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
    updateSettings({
      siteName: data.get("siteName"),
      imageDirectoryPath: data.get("imageDirectoryPath"),
      smtpServer: data.get("smtpServer"),
      smtpUsername: data.get("smtpUsername"),
      smtpPassword: data.get("smtpPassword"),
      smtpPort: data.get("smtpPort"),
    }).then(
      () => {
        setSuccessMessage("Settings updated.");
        setSubmitting(false);
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setSubmitting(false);
      }
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CheckFeatureAccess feature={ProductFeatures.ManageSettings} />
      <AccountAppBar />
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <CustomSnackbar
          message={serverError}
          severity="error"
          open={serverError}
          onClose={closeErrorSnackbar}
        />
        <CustomSnackbar
          message={successMessage}
          severity="success"
          open={successMessage}
          onClose={closeSuccessSnackbar}
        />
        <Box sx={{ mt: 3 }}>
          <Typography component="h2" variant="h5">
            Website settings
          </Typography>
        </Box>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  required
                  fullWidth
                  id="siteName"
                  label="Website Name"
                  name="siteName"
                  autoComplete="off"
                  helperText={errors.siteName}
                  error={errors.siteName}
                  defaultValue={settingsData.siteName}
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
                  defaultValue={settingsData.imageDirectoryPath}
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
                  defaultValue={settingsData.smtpServer}
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
                  defaultValue={settingsData.smtpPort}
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
                  defaultValue={settingsData.smtpUsername}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="password"
                  required
                  fullWidth
                  id="smtpPassword"
                  label="SMTP Password"
                  name="smtpPassword"
                  autoComplete="off"
                  helperText={errors.smtpPassword}
                  error={errors.smtpPassword}
                  defaultValue={settingsData.smtpPassword}
                />
              </Grid>
            </Grid>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button
                  type="button"
                  variant="outlined"
                  sx={{ mt: 3, mb: 2, mr: 1 }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={submitting}
                >
                  Save changes
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}
