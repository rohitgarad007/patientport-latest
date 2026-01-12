import { Award, Heart, Shield, Users, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  const features = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Patient-centered approach with empathy and respect",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Advanced Technology",
      description: "State-of-the-art medical equipment and facilities",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Highly qualified doctors and healthcare professionals",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Award,
      title: "Accredited Hospital",
      description: "Certified and recognized for quality healthcare",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const stats = [
    { label: "Success Rate", value: "98%", icon: TrendingUp },
    { label: "Patients Served", value: "50k+", icon: Users },
    { label: "Certifications", value: "15+", icon: Award },
  ];

  return (
    <section id="about" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="relative animate-fade-in order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-background relative">
              <img
                src="/placeholder.svg"
                alt="Modern Hospital Interior"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
            
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-primary to-secondary text-primary-foreground p-8 rounded-3xl shadow-2xl">
              <div className="text-5xl font-bold mb-1">25+</div>
              <div className="text-sm font-medium opacity-90">Years Excellence</div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-card border border-border backdrop-blur-xl p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-12 w-12 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">ISO 9001</div>
                  <div className="text-sm text-muted-foreground">Certified</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 animate-fade-in order-1 lg:order-2" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                About Our Hospital
              </div>
              <h2 className="text-4xl font-bold text-foreground md:text-5xl leading-tight">
                Leading Healthcare
                <span className="block text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
                  With Excellence
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                HealthCare Plus Hospital has been a beacon of hope and healing for over 25 years. 
                We combine cutting-edge medical technology with compassionate care to provide the 
                best possible outcomes for our patients.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 py-6 border-y border-border">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground mb-1 text-base">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-snug">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg h-12 px-8">
              Learn More About Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
