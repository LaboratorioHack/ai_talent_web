import { Suspense, type ReactNode } from "react";
import { Navbar, NavbarSkeleton } from "@/shared/components/layout";
import { getCurrentUser, getNavNotices, getSearchIndex } from "@/features/auth/api/session";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { CribaAssistant } from "@/features/assistant/components/criba-assistant";

/** La barra depende de la sesión (dato no cacheado): se streamea bajo Suspense. */
async function SessionNavbar() {
  const [user, notices, searchItems] = await Promise.all([getCurrentUser(), getNavNotices(), getSearchIndex()]);
  return <Navbar user={user} notices={notices} searchItems={searchItems} accountMenu={<AccountMenu user={user} />} />;
}

/** --app-header: alto de la barra fija; los encabezados sticky se pegan debajo. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="org-light flex flex-1 flex-col [--app-header:65px] lg:[--app-header:69px]">
      <Suspense fallback={<NavbarSkeleton />}>
        <SessionNavbar />
      </Suspense>
      <main className="flex flex-1 flex-col overflow-x-clip">{children}</main>
      <CribaAssistant audience="company" />
    </div>
  );
}
