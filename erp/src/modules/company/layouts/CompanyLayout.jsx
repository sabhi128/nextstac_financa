import React from 'react';
import { Outlet } from 'react-router-dom';
import CompanyHeader from '../components/CompanyHeader';

const CompanyLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <CompanyHeader />
            <Outlet />
        </div>
    );
};

export default CompanyLayout;
