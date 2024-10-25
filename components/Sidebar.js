import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
    return (
        <div className="w-64 bg-gray-100 h-full p-4">
            <h1 className="text-2xl font-bold mb-4">SupaPaint</h1>
            <nav>
                <ul>
                    <li><Link href="/" className="block py-2">Home</Link></li>
                    <li><Link href="/paint" className="block py-2">Paint</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;