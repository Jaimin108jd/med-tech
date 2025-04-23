import React from 'react'
interface LayoutProps {
    children: React.ReactNode
}
const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center py-4">
            {children}
        </div>
    )
}

export default Layout