import { Button } from "@/components/ui/button";
import { Calendar, Star, Award, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchHomeDoctors, HomeDoctor } from "@/services/HomeService";

const Doctors = () => {
  const [doctors, setDoctors] = useState<HomeDoctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const list = await fetchHomeDoctors();
        setDoctors(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="doctors" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Award className="h-4 w-4" />
            Meet Our Team
          </div>
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            Expert Medical Professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Highly qualified and experienced doctors dedicated to your health and wellbeing
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {loading && (
            <div className="col-span-full text-center text-muted-foreground">Loading doctors...</div>
          )}
          {error && (
            <div className="col-span-full text-center text-red-600">{error}</div>
          )}
          {doctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className="group bg-card rounded-3xl border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                <img
                  src={doctor.image || "/placeholder.svg"}
                  alt={doctor.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/95 backdrop-blur-xl px-3 py-2 rounded-full shadow-lg border border-border">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold">{doctor.rating ?? 4.8}</span>
                </div>

                <div className="absolute top-4 left-4 bg-primary/10 backdrop-blur-xl px-3 py-1.5 rounded-full border border-primary/20">
                  <span className="text-xs font-semibold text-primary">{doctor.experience ?? "10+ years"} </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-primary font-semibold text-sm">{doctor.specialty || ""}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    {doctor.specialization ?? ""}
                  </p>

                </div>

                <div className="flex items-center justify-between text-sm py-3 border-y border-border">
                  <span className="text-muted-foreground">Rs. {doctor.consultationFees ?? 0} Fees</span>
                  <span className="text-foreground font-medium">{doctor.availability ?? "Mon, Wed, Fri"}</span>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg group-hover:shadow-xl h-11">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Doctors;
