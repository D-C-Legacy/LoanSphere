
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Layout, Section } from "@/components/Layout";
import { UserRolesSection } from "@/components/UserRolesSection";
import { CompleteLendingFeatures } from "@/components/CompleteLendingFeatures";
import { LenderCTASection } from "@/components/LenderCTASection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <Layout>
      <Section id="hero" className="pt-0">
        <HeroSection />
      </Section>
      <Section id="how-it-works" className="section-spacing">
        <UserRolesSection />
      </Section>
      <Section id="comparison" className="section-spacing bg-white">
        <CompleteLendingFeatures />
      </Section>
      <Section className="section-spacing">
        <LenderCTASection />
      </Section>
      <Section id="pricing" className="section-spacing bg-gray-50">
        <PricingSection />
      </Section>
      <Footer />
    </Layout>
  );
};

export default Index;
