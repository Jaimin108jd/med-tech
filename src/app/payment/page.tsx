import React from 'react'
import { HydrateClient } from '../trpc/server'
import { ErrorBoundary } from 'react-error-boundary';
import { PaymentView } from '@/modules/patient/views/payment-view'
import { ErrorFallback } from '../complete-profile/page'

const PaymentPage = () => {
    return (
        <HydrateClient>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <PaymentView />
            </ErrorBoundary>
        </HydrateClient>
    )
}

export default PaymentPage