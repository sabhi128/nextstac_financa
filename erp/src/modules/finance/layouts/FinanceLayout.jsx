import React from 'react';
import { Outlet } from 'react-router-dom';
import FinanceHeader from '../components/FinanceHeader';

const FinanceLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <FinanceHeader />
            <Outlet />
        </div>
    );
};

export default FinanceLayout;
