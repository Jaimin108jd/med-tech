import React from 'react'

interface HomeLayoutProps {
    children: React.ReactNode
}
const HomeLayout = ({ children }: HomeLayoutProps) => {
    return (
        <>
            {/* <NavbarDemo /> */}
            <main className='flex min-h-screen w-full'>
                {children}
            </main>
        </>
    )
}

export default HomeLayout