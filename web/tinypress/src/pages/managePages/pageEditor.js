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
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CustomSnackbar from "../../partials/global/customSnackbar";
import AccountAppBar from "../../partials/account/accountAppBar";
import { useNavigate, useParams } from "react-router-dom";
import CheckFeatureAccess from "../../partials/account/checkFeatureAccess";
import ProductFeatures from "../../enums/productFeatures/productFeatures";
import * as GrapesJs from "grapesjs/dist/grapes.min";
import "grapesjs/dist/css/grapes.min.css";
import "grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css";
import "grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min";
import {
  getPageWithDraft,
  saveDraft,
} from "../../services/api/editor/editPage";
import { Alert, CircularProgress, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";

const theme = createTheme();

export default function PageEditor() {
  const [serverError, setServerError] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [initializing, setInitializing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [pageTitle, setPageTitle] = React.useState("");
  const [editor, setEditor] = React.useState(null);
  const { id } = useParams();
  const closeErrorSnackbar = () => {
    setServerError(null);
  };
  const closeSuccessSnackbar = () => {
    setSuccessMessage(null);
  };

  const navigate = useNavigate();
  const initEditor = () => {
    setInitializing(true);
    const pageId = parseInt(id);
    getPageWithDraft({ pageId: pageId || 0 }).then(
      (res) => {
        setInitializing(false);
        const editorContent = res.data.editorContent
          ? JSON.parse(res.data.editorContent)
          : undefined;
        setPageTitle(res.data.pageTitle);

        const newEditor = GrapesJs.init({
          container: "#grapes-js-editor",
          projectData: editorContent || {
            pages: [
              {
                component: `
            <div>Hello world!</div>
          `,
              },
            ],
          },
          storageManager: {
            id: "gjs-", // Prefix identifier that will be used inside storing and loading
            type: "remote", // Type of the storage
            autosave: false, // Store data automatically
            autoload: true, // Autoload stored data on init
            stepsBeforeSave: 1, // If autosave enabled, indicates how many changes are necessary before store method is triggered
            storeComponents: true, // Enable/Disable storing of components in JSON format
            storeStyles: true, // Enable/Disable storing of rules in JSON format
            storeHtml: true, // Enable/Disable storing of components as HTML string
            storeCss: true, // Enable/Disable storing of rules as CSS string
            urlStore: "/api/authed/v1/page-editor/save-draft",
            params: {}, // Custom parameters to pass with the remote storage request, eg. CSRF token
            /*headers: { "X-XSRF-TOKEN": Cookies.get("_csrf") }, // Custom headers for the remote storage request
            fetchOptions: (opts) => ({ method: "POST" }),
            // As the API stores projects in this format `{id: 1, data: projectData }`,
            // we have to properly update the body before the store and extract the
            // project data from the response result.
            onLoad: (result) => result.editorContent,
            onStore: (data, editor) => {
              const rendered = editor.Pages.getAll().map((page) => {
                const component = page.getMainComponent();
                return {
                  html: editor.getHtml({ component }),
                  css: editor.getCss({ component }),
                };
              });
              return {
                id,
                editorContent: data,
                renderedHtml: rendered.html,
                renderedCss: rendered.css,
              };
            },*/
          },
          plugins: ["gjs-preset-webpage"],
          pluginsOpts: {
            "gjs-preset-webpage": {
              formsOpts: false,
            },
          },
          styleManager: {},
          commands: {
            defaults: [
              // ...
              {
                id: "store-data",
                run(editor) {
                  editor.store();
                },
              },
            ],
          },
        });
        setEditor(newEditor);
        // Hacky fix for duplicate StyleManager entries
        newEditor.StyleManager.getSectors().models =
          newEditor.StyleManager.getSectors().models.filter(
            (value, idx, self) => {
              return (
                idx ===
                self.findIndex(
                  (t) => t.id === value.id && t.name === value.name
                )
              );
            }
          );
        newEditor.Storage.add("remote", {
          async store(data) {
            setSaving(true);
            return saveDraft({
              pageId,
              editorContent: JSON.stringify(data),
            }).then(
              () => {
                setSaving(false);
                setSuccessMessage("Draft saved!");
              },
              (err) => {
                setServerError(
                  err.response?.data?.message ?? "An error occurred."
                );
                setSaving(false);
              }
            );
          },
        });
      },
      () => {
        navigate("/dashboard", { replace: true });
        setInitializing(false);
      }
    );
  };
  React.useEffect(() => {
    initEditor(id);
  }, [id]);

  const handleSaveDraftClick = () => {
    editor.runCommand("store-data");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CheckFeatureAccess feature={ProductFeatures.AddEditContent} />
      <AccountAppBar />
      <Container
        component="main"
        maxWidth={false}
        disableGutters={true}
        style={{ overflowX: "auto" }}
      >
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

        {initializing ? (
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
          <Box sx={{ mt: 3, mx: 2, display: "flex" }}>
            <TextField
              id="outlined-basic"
              label="Page Title"
              variant="outlined"
              size="small"
              defaultValue={pageTitle}
            />
            <Box component="span" sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraftClick}
              disabled={saving}
            >
              Save changes
            </Button>
          </Box>
        )}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Box sx={{ mt: 3 }} id="grapes-js-editor" />
        </Box>
        <Box sx={{ display: { md: "none" } }}>
          <Alert severity="warning" sx={{ m: 2 }}>
            The page editor does not support mobile or touchscreen devices.
          </Alert>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
