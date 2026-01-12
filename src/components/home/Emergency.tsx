import { Button } from "@/components/ui/button";
import { Phone, Ambulance, MapPin, Clock, AlertCircle } from "lucide-react";

const Emergency = () => {
  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-gradient-to-br from-destructive/5 via-background to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--destructive)/0.08),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-5 py-2.5 rounded-full text-sm font-bold border border-destructive/20">
              <AlertCircle className="h-5 w-5" />
              24/7 Emergency Services Available
            </div>
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              Emergency Contact
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We're here for you, anytime, anywhere. Immediate assistance available round the clock.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-card rounded-3xl border border-border p-8 space-y-6 hover:shadow-2xl transition-all duration-500 animate-fade-in group">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-destructive to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-xl">Emergency Hotline</h3>
                  <p className="text-sm text-muted-foreground">Available 24/7</p>
                </div>
              </div>
              <div className="space-y-3">
                <a href="tel:1800XXXXXXX" className="block">
                  <Button variant="outline" className="w-full justify-center text-2xl font-bold h-16 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-all shadow-lg">
                    1800-XXX-XXXX
                  </Button>
                </a>
                <a href="tel:102" className="block">
                  <Button variant="outline" className="w-full justify-center text-lg h-14 border-destructive/50 text-destructive hover:bg-destructive/10">
                    <Ambulance className="mr-2 h-5 w-5" />
                    Ambulance: 102
                  </Button>
                </a>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border p-8 space-y-6 hover:shadow-2xl transition-all duration-500 animate-fade-in group" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-xl">Visit Us</h3>
                  <p className="text-sm text-muted-foreground">Main Hospital Campus</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  123 Medical Center Drive<br />
                  Health District, City - 400001
                </p>
                <Button variant="outline" className="w-full justify-center h-14 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                  <MapPin className="mr-2 h-5 w-5" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card to-muted/50 rounded-3xl border border-border p-10 text-center space-y-6 animate-fade-in shadow-xl" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg mx-auto">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-foreground">We're Always Open</h3>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-lg">
              Our emergency department operates 24/7, 365 days a year. 
              No appointment needed for emergencies.
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-muted-foreground font-medium">Emergency Care</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">&lt; 15min</div>
                <div className="text-sm text-muted-foreground font-medium">Response Time</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">100%</div>
                <div className="text-sm text-muted-foreground font-medium">Commitment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Emergency;
