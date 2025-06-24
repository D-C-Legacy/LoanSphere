import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children, className = "" }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className={`${className}`}>
        {children}
      </main>
    </div>
  );
};

// Consistent container with proper spacing
export const Container = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

// Section wrapper with consistent spacing
export const Section = ({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) => {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      {children}
    </section>
  );
};