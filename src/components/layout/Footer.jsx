import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, mt: 'auto', backgroundColor: '#f5f5f5' }}>
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} S-Bahn Status Monitor
      </Typography>
    </Box>
  );
};

export default Footer;