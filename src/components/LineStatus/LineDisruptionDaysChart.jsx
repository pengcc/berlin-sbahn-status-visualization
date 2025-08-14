import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { Card, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';

const LineDisruptionDaysChart = ({ lines, periodDays }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sort lines by disruption days for better visualization
  const sortedLines = [...lines].sort((a, b) => b.distribution_days - a.distribution_days);

  const chartData = sortedLines.map((line) => ({
    name: line.line,
    'Disruption Days': line.distribution_days,
    'Available Days': periodDays - line.distribution_days,
    availability: line.distribution_index,
  }));

  // Calculate dynamic sizes based on screen size and number of lines
  const barSize = Math.max(15, 40 - lines.length * 0.5);
  const chartHeight = 300 + lines.length * (isMobile ? 8 : 12);
  const yAxisWidth = isMobile ? 60 : 100;
  const legendWrapperStyle = {
    paddingTop: 10,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    textAlign: 'center',
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2 }}>
        <Typography variant='h6' gutterBottom sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Line Availability ({periodDays} Days)
        </Typography>
        <Box
          sx={{
            flex: 1,
            minHeight: 300,
            height: chartHeight,
            width: '100%',
            ml: isMobile ? -1 : 0, // Adjust for better mobile alignment
          }}
        >
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: isMobile ? 5 : 30,
                left: isMobile ? 5 : yAxisWidth,
                bottom: isMobile ? 10 : 40,
              }}
              layout='vertical'
              barGap={1}
              barCategoryGap={isMobile ? 5 : 10}
            >
              <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
              <XAxis
                type='number'
                domain={[0, periodDays]}
                tickCount={Math.min(periodDays + 1, 10)}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                height={isMobile ? 25 : 40} // Smaller height for mobile
              >
                <Label
                  value='Days'
                  offset={isMobile ? -5 : 5} // Minimal offset
                  position='insideBottom'
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    dy: isMobile ? 10 : 0, // Vertical adjustment
                  }}
                />
              </XAxis>
              <YAxis
                dataKey='name'
                type='category'
                width={yAxisWidth}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={0}
              />
              <Tooltip
                formatter={(value, name) => [`${value} days`, name]}
                labelFormatter={(label) => `Line ${label}`}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  fontSize: isMobile ? 12 : 14,
                }}
              />
              <Legend
                wrapperStyle={legendWrapperStyle}
                formatter={(value) => (
                  <span
                    style={{
                      color: theme.palette.text.primary,
                      fontSize: isMobile ? 11 : 12,
                    }}
                  >
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey='Disruption Days'
                stackId='a'
                fill={theme.palette.error.main}
                name='Disruption Days'
                barSize={barSize}
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey='Available Days'
                stackId='a'
                fill={theme.palette.success.main}
                name='Available Days'
                barSize={barSize}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LineDisruptionDaysChart;
