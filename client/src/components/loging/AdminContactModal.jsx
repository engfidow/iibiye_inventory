import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, DialogActions } from '@mui/material';

function AdminContactModal({ open, onClose, admins }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Administrator Contact Information</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" gutterBottom>
                    Your account is currently inactive. Please contact an administrator to activate your account:
                </Typography>
                <List>
                    {admins.map((admin, index) => (
                        <ListItem key={index}>
                            <ListItemAvatar>
                                <Avatar src={`http://localhost:5000/${admin.image}`} alt={admin.name} />
                            </ListItemAvatar>
                            <ListItemText primary={admin.name} secondary={admin.email} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AdminContactModal;
