import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Search, Shield, Award, Clock } from "lucide-react";
import heroImage from "@/assets/hero-hospital.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%),radial-gradient(circle_at_70%_60%,hsl(var(--secondary)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwNjZDQyIgc3Ryb2tlLW9wYWNpdHk9Ii4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="container relative mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-5 py-2.5 text-sm font-semibold text-primary border border-primary/20 backdrop-blur-sm">
              <Award className="h-4 w-4" />
              <span>Award-Winning Healthcare Excellence</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-7xl leading-tight">
                Experience
                <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Premium Healthcare
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground md:text-2xl max-w-xl leading-relaxed">
                World-class medical facilities, expert specialists, and compassionate care available around the clock.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl h-14 px-8 text-base font-semibold"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 h-14 px-8 text-base font-semibold hover:bg-accent"
              >
                <Search className="mr-2 h-5 w-5" />
                Find a Doctor
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-6">
              <div className="space-y-1">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-muted-foreground font-medium">Expert Doctors</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">50k+</div>
                <div className="text-sm text-muted-foreground font-medium">Happy Patients</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">30+</div>
                <div className="text-sm text-muted-foreground font-medium">Departments</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-muted-foreground font-medium">Emergency Care</div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">ISO Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Accredited</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">24/7 Service</span>
              </div>
            </div>
          </div>

          <div className="relative lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-secondary/20 to-primary/30 rounded-[2.5rem] blur-3xl animate-pulse" />
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-background">
              <img
                src={heroImage}
                alt="Modern Hospital Facility"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-card backdrop-blur-xl border border-border p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  25+
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Years of</div>
                  <div className="text-lg font-bold text-foreground">Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
