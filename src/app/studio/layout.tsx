import { StudioProvider } from '@/lib/StudioContext';
import Stepper from '@/components/Stepper';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudioProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Stepper />
        <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
      </div>
    </StudioProvider>
  );
}
