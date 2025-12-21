import React from 'react';
import { Outlet } from 'react-router-dom';
import InventoryHeader from '../components/InventoryHeader';

const InventoryLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <InventoryHeader />
            <Outlet />
        </div>
    );
};

export default InventoryLayout;
