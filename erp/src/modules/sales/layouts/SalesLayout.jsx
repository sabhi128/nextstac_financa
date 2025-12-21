import React from 'react';
import { Outlet } from 'react-router-dom';
import SalesHeader from '../components/SalesHeader';

const SalesLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <SalesHeader />
            <Outlet />
        </div>
    );
};

export default SalesLayout;
