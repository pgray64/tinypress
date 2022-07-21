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
import { useNavigate } from "react-router-dom";
import CheckFeatureAccess from "../../partials/account/checkFeatureAccess";
import ProductFeatures from "../../enums/productFeatures/productFeatures";

const theme = createTheme();

export default function PageEditor() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const closeSuccessSnackbar = () => {
    setSuccessMessage(null);
  };
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CheckFeatureAccess feature={ProductFeatures.AddEditContent} />
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
            Edit page
          </Typography>
        </Box>
        <Box sx={{ mt: 3 }}></Box>
      </Container>
    </ThemeProvider>
  );
}
