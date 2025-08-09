import { STATUS_COLORS } from '../../constants/statusTypes';

const StatusIcon = ({ status }) => {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: STATUS_COLORS[status],
      }}
    />
  );
};

export default StatusIcon;
