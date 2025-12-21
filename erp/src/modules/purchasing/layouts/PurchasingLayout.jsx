import React from 'react';
import { Outlet } from 'react-router-dom';
import PurchasingHeader from '../components/PurchasingHeader';

const PurchasingLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <PurchasingHeader />
            <Outlet />
        </div>
    );
};

export default PurchasingLayout;
