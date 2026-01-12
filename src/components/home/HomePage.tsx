import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Departments from "@/components/home/Departments";
import Doctors from "@/components/home/Doctors";
import Testimonials from "@/components/home/Testimonials";
import Emergency from "@/components/home/Emergency";
import ChatWidget from "@/components/home/chat/ChatWidget";
import Footer from "@/components/home/Footer";
import UltraFloatingChatButton from "@/components/home/chat/UltraFloatingChatButton";
const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Departments />
      <Doctors />
      <Testimonials />
      <Emergency />
      <Footer />
      <UltraFloatingChatButton />
    </div>
  );
};

export default HomePage;
