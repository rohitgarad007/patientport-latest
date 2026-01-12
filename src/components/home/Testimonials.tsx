import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Amit Verma",
      role: "Patient - Cardiology",
      content: "The care I received at HealthCare Plus was exceptional. The doctors and staff were incredibly professional and compassionate. I'm grateful for their expertise during my treatment.",
      rating: 5,
      image: "/placeholder.svg"
    },
    {
      name: "Sunita Reddy",
      role: "Patient - Orthopedics",
      content: "From booking to discharge, everything was smooth. The facilities are world-class and the medical team truly cares about patient wellbeing. Highly recommend!",
      rating: 5,
      image: "/placeholder.svg"
    },
    {
      name: "Rahul Mehta",
      role: "Patient - Emergency Care",
      content: "Emergency services here are outstanding. They responded quickly and provided excellent care. The entire experience gave me confidence in their capabilities.",
      rating: 5,
      image: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.03),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            Patient Stories
          </div>
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            What Our Patients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from real patients who trust us with their health
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative p-8 space-y-6 hover:shadow-2xl transition-all duration-500 animate-fade-in border-border bg-card rounded-3xl overflow-hidden group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative">
                <Quote className="h-12 w-12 text-primary/20 mb-4" />
                
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-muted-foreground italic leading-relaxed text-base">
                  "{testimonial.content}"
                </p>
              </div>

              <div className="relative flex items-center gap-4 pt-6 border-t border-border">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-lg flex-shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
