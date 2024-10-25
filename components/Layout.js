import React from 'react';
import Head from "next/head";

const Layout = ({ children }) => {
    return (
        <div className="relative min-h-screen">
            <Head>
                <title>SupaPaint AI Image Editor</title>
                <meta name="description" content="AI Image editing app" />
            </Head>
            <main className="pl-12 pt-2 pr-2">
                {children}
            </main>
        </div>
    );
};

export default Layout;
