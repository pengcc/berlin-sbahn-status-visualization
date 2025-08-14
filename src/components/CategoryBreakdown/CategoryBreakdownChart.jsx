import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, useTheme, useMediaQuery } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CategoryBreakdownChart = ({ categories }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const data = categories.map((category) => ({
    name: category.name,
    value: category.subcategories.reduce((sum, sub) => sum + sub.count, 0),
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Disruption Categories
        </Typography>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
              nameKey='name'
              label={({ name, percent }) =>
                `${isMobile ? '' : name + ' '}${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownChart;
