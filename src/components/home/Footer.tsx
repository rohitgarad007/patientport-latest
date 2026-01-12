import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.03),transparent_70%)]" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <Heart className="h-6 w-6 text-primary-foreground fill-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/50 to-secondary/50 blur-lg opacity-50" />
              </div>
              <span className="text-xl font-bold text-foreground">HealthCare Plus</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Providing compassionate healthcare with excellence for over 25 years. Your health is our priority, your trust is our achievement.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group">
                <Facebook className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group">
                <Twitter className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group">
                <Instagram className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group">
                <Linkedin className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary" />
                About Us
              </a></li>
              <li><a href="#departments" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary" />
                Departments
              </a></li>
              <li><a href="#doctors" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary" />
                Our Doctors
              </a></li>
              <li><a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary" />
                Contact
              </a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">Services</h3>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                24/7 Emergency
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Online Consultation
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Lab Services
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Health Checkups
              </li>
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Pharmacy
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Call Us</div>
                  <span className="text-foreground font-medium">1800-XXX-XXXX</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="h-9 w-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  <span className="text-foreground font-medium">info@healthcareplus.com</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Location</div>
                  <span className="text-foreground font-medium leading-snug">123 Medical Center Drive<br/>Health District, City - 400001</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 HealthCare Plus Hospital. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Made with</span>
            <Heart className="h-4 w-4 fill-destructive text-destructive animate-pulse" />
            <span className="text-muted-foreground">for better healthcare</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
