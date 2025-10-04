import { Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashBoardLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingState } from '@/components/ui/LoadingState';

export default function DashboardPage() {
  // This page is kept clean. All the logic and layout are in the DashboardLayout component.
  // This makes it easy to switch layouts or add wrappers (like auth providers) later.
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState message="Loading dashboard..." size="lg" />}>
        <DashboardLayout />
      </Suspense>
    </ErrorBoundary>
  );
}