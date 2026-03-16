import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Brain, Bone, Baby, ScanLine, Ambulance, Phone, Mail, MapPin,
  Star, Menu, X, Send, Linkedin, Twitter, Facebook, Instagram, ArrowLeft,
  Leaf, TreePine, Sprout, Eye, Target, ChevronLeft, ChevronRight, Quote
} from "lucide-react";

import type { HospitalAmenityItem, HospitalPublicAbout, HospitalPublicDoctor, HospitalSpecializationItem } from "@/services/HospitalService";

import heroImg1 from "@/assets/hero-hospital-1.jpg";
import heroImg2 from "@/assets/hero-hospital-2.jpg";
import heroImg3 from "@/assets/hero-hospital-3.jpg";
import heroImg4 from "@/assets/hero-hospital-4.jpg";
import heroImg5 from "@/assets/hero-hospital-5.jpg";
import heroImg6 from "@/assets/hero-hospital-6.jpg";
import gardenImg from "@/assets/hospital-garden.jpg";
import doctor1 from "@/assets/doctor-5.jpg";
import doctor2 from "@/assets/doctor-6.jpg";
import doctor3 from "@/assets/doctor-3.jpg";
import doctor4 from "@/assets/doctor-4.jpg";
import maleDoctorImg from "@/assets/male-doctor.png";
import femaleDoctorImg from "@/assets/female-doctor.png";
import patient1 from "@/assets/patient-1.jpg";
import patient2 from "@/assets/patient-2.jpg";
import patient3 from "@/assets/patient-3.jpg";
import patient4 from "@/assets/patient-4.jpg";

const slides = [
  { image: heroImg1, headline: "Healing Through Nature", desc: "Where modern medicine meets holistic healing in a serene, green environment." },
  { image: heroImg2, headline: "Holistic Patient Care", desc: "Integrating traditional medicine with wellness programs for complete recovery." },
  { image: heroImg3, headline: "Advanced Green Medicine", desc: "Sustainable healthcare practices with world-class surgical expertise." },
  { image: heroImg4, headline: "Caring Professionals", desc: "A dedicated team nurturing your health with compassion and expertise." },
  { image: heroImg5, headline: "Wellness First Approach", desc: "Our philosophy centers on prevention, healing, and long-term wellness." },
  { image: heroImg6, headline: "Your Health Partners", desc: "Building lasting relationships for lifetime healthcare management." },
];

const departments = [
  { icon: Heart, name: "Cardiology", desc: "Heart-centered care with natural rehabilitation therapies." },
  { icon: Brain, name: "Neurology", desc: "Neurological treatments combining medicine and mindfulness." },
  { icon: Bone, name: "Orthopedics", desc: "Joint and bone care with nature-based recovery programs." },
  { icon: Baby, name: "Pediatrics", desc: "Gentle, nature-inspired care for your little ones." },
  { icon: ScanLine, name: "Diagnostics", desc: "Precise imaging with eco-friendly medical technology." },
  { icon: Ambulance, name: "Emergency", desc: "Round-the-clock emergency care with rapid response." },
];

const doctors = [
  { photo: doctor1, name: "Dr. Alan Greenfield", spec: "Cardiologist", exp: "20+ Years" },
  { photo: doctor2, name: "Dr. Priya Sharma", spec: "Neurologist", exp: "14+ Years" },
  { photo: doctor3, name: "Dr. Thomas Lee", spec: "Orthopedic", exp: "16+ Years" },
  { photo: doctor4, name: "Dr. Rachel Kim", spec: "Pediatrician", exp: "11+ Years" },
];

const testimonials = [
  { photo: patient1, name: "James Foster", review: "The healing garden and integrative approach made my recovery so much faster and more peaceful. Truly a unique medical experience.", rating: 5 },
  { photo: patient2, name: "Susan Park", review: "I felt genuinely cared for. The combination of modern medicine and holistic wellness is exactly what I needed.", rating: 5 },
  { photo: patient3, name: "Howard Mills", review: "Beautiful campus, outstanding doctors. Green Valley changed my perspective on healthcare entirely.", rating: 5 },
  { photo: patient4, name: "Anna Rivera", review: "The nutrition counseling and rehabilitation gardens accelerated my recovery. Highly recommend this center!", rating: 4 },
];

const navLinks = ["Home", "About Us", "Departments", "Doctors", "Testimonials", "Contact"];

type Props = {
  hospitalName?: string;
  specializations?: HospitalSpecializationItem[];
  doctors?: HospitalPublicDoctor[];
  about?: HospitalPublicAbout | null;
  amenities?: HospitalAmenityItem[];
};

// ─── Hospital 2: Green Valley ──────────────────────────────────
// Design: Organic shapes, wave section dividers, nature-inspired greens,
// rounded card designs, earthy tones, overlapping elements
const LiveTemplate2 = ({ hospitalName, specializations, doctors: publicDoctors }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [tIdx, setTIdx] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const resolvedDepartments = (() => {
    if (specializations && specializations.length > 0) {
      const icons = [Heart, Brain, Bone, Baby, ScanLine, Ambulance, Eye, Target];
      return specializations.map((s, idx) => ({
        icon: icons[idx % icons.length],
        name: String(s.name ?? ""),
        desc: String(s.description ?? ""),
      }));
    }
    return departments;
  })();

  const resolvedDoctors = (() => {
    if (publicDoctors && publicDoctors.length > 0) {
      const formatExp = (y?: string, m?: string) => {
        const yy = Number(y || 0);
        const mm = Number(m || 0);
        if (!yy && !mm) return "—";
        const parts: string[] = [];
        if (yy) parts.push(`${yy}y`);
        if (mm) parts.push(`${mm}m`);
        return parts.join(" ");
      };
      const resolvePhoto = (src?: string, gender?: string) => {
        const s = String(src ?? "");
        if (s) return s;
        const g = String(gender ?? "").trim().toUpperCase();
        const isFemale = g === "F" || g === "FEMALE";
        return isFemale ? femaleDoctorImg : maleDoctorImg;
      };
      return publicDoctors.map((d) => ({
        photo: resolvePhoto(d.profile_image, d.gender),
        name: d.name,
        spec: d.specialization_name || "Specialist",
        exp: formatExp(d.experience_year, d.experience_month),
      }));
    }
    return doctors;
  })();

  useEffect(() => { const h = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const nextSlide = useCallback(() => setSlide(s => (s + 1) % slides.length), []);
  useEffect(() => { const t = setInterval(nextSlide, 4500); return () => clearInterval(t); }, [nextSlide]);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 5000); return () => clearInterval(t); }, []);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };

  return (
    <div className="font-poppins">
      {/* ── HEADER: Transparent to green ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[hsl(152,55%,38%)]/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-5"}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/"><ArrowLeft className="w-5 h-5" style={{ color: "#fff" }} /></Link>
            <Leaf className="w-8 h-8" style={{ color: "#fff" }} />
            <span className="text-lg font-bold" style={{ color: "#fff" }}>{hospitalName || "Green Valley"}</span>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className="text-sm font-medium hover:opacity-80" style={{ color: "#fff" }}>{l}</button>)}
            <button onClick={() => scrollTo("contact")} className="bg-[hsl(0,0%,100%)] text-[hsl(152,55%,33%)] px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> Appointment
            </button>
          </nav>
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X style={{ color: "#fff" }} /> : <Menu style={{ color: "#fff" }} />}</button>
        </div>
        {mobileMenu && <div className="lg:hidden bg-[hsl(152,55%,35%)] px-4 pb-4">{navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className="block w-full text-left py-2 text-sm" style={{ color: "#fff" }}>{l}</button>)}<button onClick={() => scrollTo("contact")} className="mt-2 w-full bg-[hsl(0,0%,100%)] text-[hsl(152,55%,33%)] px-5 py-2 rounded-full text-sm font-bold">Book Appointment</button></div>}
      </header>

      {/* ── HERO: Split layout - text left, image collage right ── */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <img src={s.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, hsla(152,55%,15%,0.9) 0%, hsla(152,55%,25%,0.6) 50%, hsla(152,55%,25%,0.3) 100%)" }} />
          </div>
        ))}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-6"><Sprout style={{ color: "hsl(120,60%,70%)" }} /><span className="text-sm font-medium" style={{ color: "hsl(120,60%,70%)" }}>Holistic Healthcare Center</span></div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight animate-fade-up" style={{ color: "#fff" }}>{slides[slide].headline}</h1>
              <p className="text-lg mb-8 animate-fade-up-delay-1" style={{ color: "hsl(0,0%,100%,0.8)" }}>{slides[slide].desc}</p>
              <button className="bg-[hsl(0,0%,100%)] text-[hsl(152,55%,33%)] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform animate-fade-up-delay-2">Book Appointment</button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`w-3 h-3 rounded-full transition-all ${i === slide ? "bg-[hsl(0,0%,100%)] scale-125" : "bg-[hsl(0,0%,100%,0.4)]"}`} />)}
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 120" fill="none"><path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,80 L1440,120 L0,120Z" fill="hsl(0,0%,100%)" /></svg>
        </div>
      </section>

      {/* ── ABOUT: Overlapping card layout with nature imagery ── */}
      <section id="about-us" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[hsl(152,55%,38%)] font-semibold uppercase tracking-wider text-sm flex items-center gap-2"><TreePine className="w-4 h-4" /> About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-3 mb-6">Healing with Nature's Touch</h2>
              <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-4">Green Valley Medical Center blends modern medicine with holistic healing, creating a unique healthcare experience surrounded by nature's tranquility.</p>
              <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-6">Founded in 2005, our center has grown into a premier healthcare destination with 350+ beds and specialized treatment programs that emphasize both physical and mental wellness.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[hsl(152,55%,94%)] rounded-2xl p-5 text-center">
                  <Target className="w-8 h-8 text-[hsl(152,55%,38%)] mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-[hsl(220,20%,15%)]">Our Mission</h4>
                  <p className="text-xs text-[hsl(215,16%,47%)] mt-1">Heal body, mind & spirit</p>
                </div>
                <div className="bg-[hsl(200,70%,94%)] rounded-2xl p-5 text-center">
                  <Eye className="w-8 h-8 text-[hsl(200,70%,50%)] mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-[hsl(220,20%,15%)]">Our Vision</h4>
                  <p className="text-xs text-[hsl(215,16%,47%)] mt-1">Pioneer holistic healthcare</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-8">
                {[{ v: "18+", l: "Years" }, { v: "150+", l: "Doctors" }, { v: "35K+", l: "Patients" }, { v: "25+", l: "Depts" }].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-extrabold text-[hsl(152,55%,38%)]">{s.v}</div>
                    <div className="text-xs text-[hsl(215,16%,47%)]">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <img src={gardenImg} alt="Hospital garden" className="rounded-3xl shadow-xl w-full" />
              <div className="absolute -bottom-4 -left-4 bg-[hsl(152,55%,38%)] rounded-2xl p-5 shadow-lg hidden md:flex items-center gap-3">
                <Leaf className="w-8 h-8" style={{ color: "#fff" }} />
                <div>
                  <div className="text-lg font-bold" style={{ color: "#fff" }}>Eco-Certified</div>
                  <div className="text-xs" style={{ color: "hsl(0,0%,100%,0.7)" }}>Green Building Standard</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS: Horizontal scrolling cards with green accent ── */}
      <section id="departments" className="py-20 bg-[hsl(152,55%,96%)] relative">
        <div className="absolute top-0 left-0 right-0"><svg viewBox="0 0 1440 60" fill="none"><path d="M0,30 C480,60 960,0 1440,30 L1440,0 L0,0Z" fill="hsl(0,0%,100%)" /></svg></div>
        <div className="container mx-auto px-4 pt-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[hsl(152,55%,38%)] font-semibold uppercase tracking-wider text-sm">Our Specialties</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2">Medical Departments</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolvedDepartments.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[hsl(0,0%,100%)] rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all border-l-4 border-[hsl(152,55%,38%)] group hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[hsl(152,55%,94%)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(152,55%,38%)] transition-colors">
                    <d.icon className="w-7 h-7 text-[hsl(152,55%,38%)] group-hover:text-[hsl(0,0%,100%)] transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[hsl(220,20%,15%)] mb-1">{d.name}</h3>
                    <p className="text-sm text-[hsl(215,16%,47%)] leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTORS: Circular photo cards with green theme ── */}
      <section id="doctors" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[hsl(152,55%,38%)] font-semibold uppercase tracking-wider text-sm">Meet Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2">Our Expert Physicians</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {resolvedDoctors.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center group">
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-[hsl(152,55%,85%)] group-hover:border-[hsl(152,55%,38%)] transition-colors">
                    <img src={d.photo} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                    {[Linkedin, Twitter].map((Icon, j) => <a key={j} href="#" className="w-8 h-8 rounded-full bg-[hsl(152,55%,38%)] flex items-center justify-center hover:scale-110 transition-transform shadow-md"><Icon className="w-3.5 h-3.5" style={{ color: "#fff" }} /></a>)}
                  </div>
                </div>
                <h3 className="font-bold text-[hsl(220,20%,15%)]">{d.name}</h3>
                <p className="text-[hsl(152,55%,38%)] text-sm font-medium">{d.spec}</p>
                <p className="text-xs text-[hsl(215,16%,47%)] mt-1">{d.exp} Experience</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS: Side-by-side cards ── */}
      <section id="testimonials" className="py-20 bg-[hsl(152,55%,96%)] relative">
        <div className="absolute top-0 left-0 right-0"><svg viewBox="0 0 1440 60" fill="none"><path d="M0,0 C480,60 960,0 1440,60 L1440,0 L0,0Z" fill="hsl(0,0%,100%)" /></svg></div>
        <div className="container mx-auto px-4 pt-8">
          <div className="text-center mb-16">
            <span className="text-[hsl(152,55%,38%)] font-semibold uppercase tracking-wider text-sm">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2">Patient Stories</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[hsl(0,0%,100%)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img src={t.photo} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-[hsl(152,55%,85%)]" />
                  <div>
                    <h4 className="font-bold text-[hsl(220,20%,15%)]">{t.name}</h4>
                    <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < t.rating ? "fill-[hsl(45,100%,55%)] text-[hsl(45,100%,55%)]" : "text-[hsl(215,16%,80%)]"}`} />)}</div>
                  </div>
                </div>
                <p className="text-sm text-[hsl(215,16%,47%)] italic leading-relaxed">"{t.review}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT: Full-width green banner + form ── */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[hsl(152,55%,38%)] font-semibold uppercase tracking-wider text-sm">Get In Touch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2">Contact Us</h2>
          </div>
          <div className="bg-[hsl(152,55%,96%)] rounded-3xl p-8 md:p-12">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <form onSubmit={e => { e.preventDefault(); alert("Message sent!"); setForm({ name: "", email: "", phone: "", message: "" }); }} className="space-y-4">
                  <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-5 py-3 rounded-xl border-0 bg-[hsl(0,0%,100%)] focus:ring-2 focus:ring-[hsl(152,55%,38%)] focus:outline-none" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full px-5 py-3 rounded-xl border-0 bg-[hsl(0,0%,100%)] focus:ring-2 focus:ring-[hsl(152,55%,38%)] focus:outline-none" />
                    <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-5 py-3 rounded-xl border-0 bg-[hsl(0,0%,100%)] focus:ring-2 focus:ring-[hsl(152,55%,38%)] focus:outline-none" />
                  </div>
                  <textarea placeholder="Message" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required className="w-full px-5 py-3 rounded-xl border-0 bg-[hsl(0,0%,100%)] focus:ring-2 focus:ring-[hsl(152,55%,38%)] focus:outline-none resize-none" />
                  <button type="submit" className="bg-[hsl(152,55%,38%)] px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2" style={{ color: "#fff" }}><Send className="w-4 h-4" /> Send</button>
                </form>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {[
                  { icon: MapPin, text: "456 Green Valley Blvd, San Francisco, CA 94102" },
                  { icon: Phone, text: "+1 (555) 987-6543" },
                  { icon: Mail, text: "info@greenvalleymedical.com" },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(152,55%,38%)] flex items-center justify-center flex-shrink-0"><c.icon className="w-5 h-5" style={{ color: "#fff" }} /></div>
                    <span className="text-sm text-[hsl(215,16%,47%)] pt-2">{c.text}</span>
                  </div>
                ))}
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1!2d-122.42!3d37.77" width="100%" height="180" style={{ border: 0, borderRadius: "1rem" }} allowFullScreen loading="lazy" title="Map" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER: Green gradient ── */}
      <footer className="bg-[hsl(152,55%,20%)] py-14">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4"><Leaf className="w-7 h-7" style={{ color: "#fff" }} /><span className="text-lg font-bold" style={{ color: "#fff" }}>{hospitalName || "Green Valley"}</span></div>
              <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.6)" }}>Healing the whole person through integrative healthcare since 2005.</p>
              <div className="flex gap-3 mt-4">{[Facebook, Twitter, Instagram, Linkedin].map((I, i) => <a key={i} href="#" className="w-8 h-8 rounded-full bg-[hsl(0,0%,100%,0.1)] flex items-center justify-center hover:bg-[hsl(0,0%,100%,0.2)]"><I className="w-4 h-4" style={{ color: "#fff" }} /></a>)}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Quick Links</h4>
              <ul className="space-y-2">{navLinks.map(l => <li key={l}><a href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="text-sm" style={{ color: "hsl(0,0%,100%,0.6)" }}>{l}</a></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Departments</h4>
              <ul className="space-y-2">{resolvedDepartments.map(d => <li key={d.name}><span className="text-sm" style={{ color: "hsl(0,0%,100%,0.6)" }}>{d.name}</span></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: "hsl(0,0%,100%,0.6)" }}>
                <p>456 Green Valley Blvd, SF, CA</p>
                <p>+1 (555) 987-6543</p>
                <p>info@greenvalleymedical.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[hsl(0,0%,100%,0.1)] mt-10 pt-6 text-center">
            <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.4)" }}>© 2026 Green Valley Medical Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiveTemplate2;
