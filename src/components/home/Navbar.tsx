import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Clock, Sparkles } from "lucide-react";
  import { PaIcons } from "@/components/icons/PaIcons";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b backdrop-blur-xl bg-background/80 border-border/40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/home" className="flex items-center gap-3 group">
              
              <img src={PaIcons.hospital1} alt="Email" className="w-12 h-12 " />
              
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground tracking-tight">HealthCare Pro</span>
              </div>
            </a>
            
            <div className="hidden lg:flex items-center gap-1">
              <a href="#about" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
                About
              </a>
              <a href="#departments" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
                Departments
              </a>
              <a href="#doctors" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
                Doctors
              </a>
              <a href="#contact" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
                Contact
              </a>
              <div className="w-px h-6 bg-border mx-2" />
              
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-6 mr-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Call Now</span>
                  <span className="font-semibold text-foreground">1800-XXX-XXXX</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-destructive/10">
                  <Clock className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Emergency</span>
                  <span className="font-semibold text-foreground">24/7 Open</span>
                </div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl px-6">
              Book Appointment
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden py-6 space-y-3 animate-fade-in border-t border-border mt-4">
            <a href="#about" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
              About
            </a>
            <a href="#departments" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
              Departments
            </a>
            <a href="#doctors" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
              Doctors
            </a>
            <a href="#contact" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all">
              Contact
            </a>
            <div className="border-t border-border my-3" />
            <a href="/home-2" className="block px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all">
              Home 2
            </a>
            <a href="/home-3" className="block px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all">
              Home 3
            </a>
            <a href="/home-4" className="block px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all">
              Home 4
            </a>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Call Now</span>
                  <span className="text-sm font-semibold">1800-XXX-XXXX</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary shadow-lg">
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
