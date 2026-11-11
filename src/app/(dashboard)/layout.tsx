import { Suspense, type ReactNode } from "react";
import { Navbar, NavbarSkeleton } from "@/shared/components/layout";
import { getCurrentUser, getNavCounts } from "@/features/auth/api/session";

/** La barra depende de la sesión (dato no cacheado): se streamea bajo Suspense. */
async function SessionNavbar() {
  const [user, counts] = await Promise.all([getCurrentUser(), getNavCounts()]);
  return <Navbar user={user} counts={counts} />;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <SessionNavbar />
      </Suspense>
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
