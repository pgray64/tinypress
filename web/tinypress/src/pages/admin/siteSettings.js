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
import { CircularProgress, Divider, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import CheckFeatureAccess from "../../partials/account/checkFeatureAccess";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import TextField from "@mui/material/TextField";
import { validateFormData } from "../../helpers/validation/validateFormData";
import Button from "@mui/material/Button";
import { getSiteSettings } from "../../services/api/admin/siteSettings";
import GeneralSiteSettings from "../../partials/admin/siteSettings/generalSiteSettings";
import SmtpSettings from "../../partials/admin/siteSettings/smtpSettings";

const theme = createTheme();

export default function SiteSettings() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [settingsData, setSettingsData] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const closeSuccessSnackbar = () => {
    setSuccessMessage(null);
  };
  const navigate = useNavigate();

  React.useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = () => {
    getSiteSettings().then(
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CheckFeatureAccess feature={ProductFeatures.ManageSettings} />
      <AccountAppBar />
      <Container component="main" maxWidth="lg">
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
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <GeneralSiteSettings
                    settingsData={settingsData}
                    onSave={loadSettings}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <SmtpSettings
                    settingsData={settingsData}
                    onSave={loadSettings}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}
