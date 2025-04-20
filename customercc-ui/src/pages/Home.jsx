import React from 'react';
import { Typography, Box } from '@mui/material';
import PieChartComponent from './chart';
// import { useNavigate } from 'react-router-dom';

const Home = () => {
    // const navigate = useNavigate();

    return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h3" gutterBottom>
                Team 1 CapStone Demo
            </Typography>
            <PieChartComponent />
        </Box>
    );
};

export default Home;