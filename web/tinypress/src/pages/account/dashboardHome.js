/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CustomSnackbar from "../../partials/global/customSnackbar";
import AccountAppBar from "../../partials/account/accountAppBar";
import AuthContext from "../../contexts/authContext";
import { Button, Paper } from "@mui/material";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import { useLocation, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Add } from "@mui/icons-material";

const theme = createTheme();

export default function DashboardHome() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const authData = React.useContext(AuthContext);

  const closeSnackbars = () => {
    setServerError(null);
    setSuccessMessage(null);
  };

  React.useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state?.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AccountAppBar />
      <Container component="main" maxWidth="xl">
        <CssBaseline />
        <CustomSnackbar
          message={serverError}
          severity="error"
          open={serverError}
          onClose={closeSnackbars}
        />
        <CustomSnackbar
          message={successMessage}
          severity="success"
          open={successMessage}
          onClose={closeSnackbars}
        />
        <Grid container sx={{ mt: 3 }} spacing={2}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>Some card here</Paper>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>Some other card goes here...</Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
