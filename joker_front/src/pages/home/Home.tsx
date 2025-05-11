import { useEffect } from "react";
import Footer from "../../components/footer/Footer";
import Services from "../../components/services/Services";
import Hero from "../../components/hero/Hero";
import Features from "../../components/features/Features";
import AboutUs from "../../components/about/AboutUs";
import AOS from "aos";

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1">
        <Hero />
        <Features />
        <AboutUs />
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
