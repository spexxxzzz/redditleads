import { DashboardLayout } from '@/components/dashboard/DashBoardLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function DashboardPage() {
  // This page is kept clean. All the logic and layout are in the DashboardLayout component.
  // This makes it easy to switch layouts or add wrappers (like auth providers) later.
  return (
    <ErrorBoundary>
      <DashboardLayout />
    </ErrorBoundary>
  );
}