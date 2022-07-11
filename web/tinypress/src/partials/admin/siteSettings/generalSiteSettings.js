/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from "react";
import Box from "@mui/material/Box";
import CustomSnackbar from "../../../partials/global/customSnackbar";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { validateFormData } from "../../../helpers/validation/validateFormData";
import Button from "@mui/material/Button";
import { updateGeneralSettings } from "../../../services/api/admin/siteSettings";
import Typography from "@mui/material/Typography";

export default function GeneralSiteSettings({ settingsData, onSave }) {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isEditing, setIsEditing] = React.useState(false);

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
  };

  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const closeSuccessSnackbar = () => {
    setSuccessMessage(null);
  };
  const handleCancel = () => {
    setIsEditing(false);
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
    updateGeneralSettings({
      siteName: data.get("siteName"),
      imageDirectoryPath: data.get("imageDirectoryPath"),
    }).then(
      () => {
        setSuccessMessage("General settings updated.");
        setSubmitting(false);
        setIsEditing(false);
        onSave();
      },
      (err) => {
        setServerError(err.response?.data?.message ?? "An error occurred.");
        setSubmitting(false);
      }
    );
  };

  return (
    <Box>
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
      <Grid container>
        <Grid item xs={12} sm={9}>
          <Typography component="h2" variant="h5">
            General settings
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={3}
          sx={{
            display: isEditing ? "none" : undefined,
            textAlign: { sm: "right" },
          }}
        >
          <Button
            variant="contained"
            sx={{ mt: { xs: 1, sm: 0 } }}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Edit
          </Button>
        </Grid>
      </Grid>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {isEditing ? (
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
          </Grid>
        ) : (
          <Box>
            <Grid container>
              <Grid item xs={5} sx={{ pb: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Website name:
                </Typography>
              </Grid>
              <Grid item xs={7} sx={{ pb: 1 }}>
                {settingsData.siteName}
              </Grid>
              <Grid item xs={5} sx={{ pb: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Image directory path:
                </Typography>
              </Grid>
              <Grid item xs={7} sx={{ pb: 1 }}>
                {settingsData.imageDirectoryPath}
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}
