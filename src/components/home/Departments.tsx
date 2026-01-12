import { Heart, Brain, Baby, Bone, Activity, Ambulance, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import departments from "@/data/departments.json";

const iconMap: Record<string, any> = {
  Heart,
  Brain,
  Baby,
  Bone,
  Activity,
  Ambulance
};

const gradientMap: Record<string, string> = {
  Heart: "from-red-500 to-pink-500",
  Brain: "from-purple-500 to-indigo-500",
  Baby: "from-pink-500 to-rose-500",
  Bone: "from-slate-500 to-zinc-500",
  Activity: "from-green-500 to-emerald-500",
  Ambulance: "from-orange-500 to-red-500"
};

const Departments = () => {
  return (
    <section id="departments" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
            Medical Specialties
          </div>
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            Our Departments
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive healthcare services across multiple specialties with expert care
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept, index) => {
            const Icon = iconMap[dept.icon];
            const gradient = gradientMap[dept.icon];
            return (
              <div
                key={dept.id}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card hover:shadow-2xl transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="text-sm font-semibold text-foreground">Key Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {dept.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground border border-border"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10 h-12 group/btn">
                    <span className="font-semibold">Learn More</span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Departments;
