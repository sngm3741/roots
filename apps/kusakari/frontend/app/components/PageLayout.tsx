import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { FloatingContactBar } from "./FloatingContactBar";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
