import React from 'react';
import { Outlet } from 'react-router-dom';
import HRHeader from '../components/HRHeader';

const HRLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <HRHeader />
            <Outlet />
        </div>
    );
};

export default HRLayout;
