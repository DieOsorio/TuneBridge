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
  className,
  color 
}) => {
  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle className="!bg-gray-300 !text-center !mb-6">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions className="!justify-center">
        {onCancel && 
        (<Button 
          onClick={onCancel} 
          className="!min-w-30 !bg-gray-600 hover:!bg-gray-700" 
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
          className={`!min-w-30 ${className}`}
        >
          {confirmLabel}
        </Button>
      )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
