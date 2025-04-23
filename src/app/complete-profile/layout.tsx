import React from 'react'
import { HydrateClient, trpc } from '../trpc/server'
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './page';
interface RedirectLayoutProps {
    children: React.ReactNode
}
const RedirectLayout = ({ children }: RedirectLayoutProps) => {
    void trpc.doctorType.getDoctorTypes.prefetch();
    return (
        <HydrateClient>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                {children}
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default RedirectLayout