// src/components/layout/Footer.jsx
import { Box, Typography, Link, Grid, Divider, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component='footer'
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#f5f5f5',
        borderTop: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
      }}
    >
      <Grid container spacing={2} justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Disclaimer
          </Typography>

          <Typography variant='body2' sx={{ mb: 1.5, textAlign: { xs: 'center', md: 'left' } }}>
            This project uses publicly available data from the{' '}
            <Link
              href='https://x.com/SBahnBerlin'
              target='_blank'
              rel='noopener noreferrer'
              color='primary'
              sx={{ fontWeight: 600 }}
            >
              @SBahnBerlin Twitter/X account
            </Link>{' '}
            for{' '}
            <strong style={{ color: theme.palette.error.main }}>educational purposes only</strong>.
          </Typography>

          <Typography variant='body2' sx={{ mb: 1.5, textAlign: { xs: 'center', md: 'left' } }}>
            It is a personal initiative to practice data analysis and React development skills. The
            visualizations and status information shown here may not fully or accurately represent
            the actual operational conditions of the Berlin S-Bahn system.
          </Typography>

          <Typography variant='body2' sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            This is not an official service, and users should rely on authoritative sources for
            critical travel decisions.
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              justifyContent: 'center',
              gap: 2,
              mt: { xs: 2, md: 0 },
            }}
          >
            <Link
              href='https://github.com/pengcc/berlin-sbahn-status-visualization'
              target='_blank'
              rel='noopener noreferrer'
              color='inherit'
              variant='body2'
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              GitHub Repository
            </Link>
            <Link
              href='https://x.com/SBahnBerlin'
              target='_blank'
              rel='noopener noreferrer'
              color='inherit'
              variant='body2'
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Data Source
            </Link>
            <Link
              href='https://sbahn.berlin'
              target='_blank'
              rel='noopener noreferrer'
              color='inherit'
              variant='body2'
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Official S-Bahn Site
            </Link>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2, mx: 'auto', width: '80%' }} />

      <Typography
        variant='body2'
        align='center'
        sx={{
          fontSize: '0.75rem',
          color: theme.palette.text.secondary,
        }}
      >
        © {new Date().getFullYear()} Berlin S-Bahn Status Visualization | Educational Project - Not
        affiliated with BVG or DB
      </Typography>
    </Box>
  );
};

export default Footer;
