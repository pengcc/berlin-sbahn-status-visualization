import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../../constants/statusTypes';

const StatusBadge = ({ status, count }) => {
  return (
    <Chip
      label={count ? `${status} (${count})` : status}
      sx={{
        backgroundColor: STATUS_COLORS[status],
        color: 'white',
        fontWeight: 'bold',
      }}
      size="small"
    />
  );
};

export default StatusBadge;