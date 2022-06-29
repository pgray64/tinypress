import { Alert, Snackbar } from "@mui/material";

export default function CustomSnackbar({ message, severity, open, onClose }) {
  return (
    <Snackbar
      autoHideDuration={5000}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
