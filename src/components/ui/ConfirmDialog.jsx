import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmLabel, 
  cancelLabel,
  color }) => {
  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {onCancel && 
        (<Button 
          onClick={onCancel} 
          className="!bg-gray-500 hover:!bg-gray-600" 
          variant="contained"
        >
          {cancelLabel}
        </Button>
      )}
        {onConfirm && 
        (<Button 
          onClick={onConfirm} 
          color= {color}
          variant="contained"
        >
          {confirmLabel}
        </Button>
      )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
