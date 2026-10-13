import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import SampleReport from "@/components/SampleReport";
import GenerateForm from "@/components/GenerateForm";

import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorks />
        <FeaturesSection />
        <SampleReport />
        <GenerateForm />

        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
