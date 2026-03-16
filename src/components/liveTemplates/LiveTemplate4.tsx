import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Brain, Bone, Baby, ScanLine, Ambulance, Phone, Mail, MapPin,
  Star, Menu, X, Send, Linkedin, Twitter, Facebook, Instagram, ArrowLeft,
  Zap, Activity, Cpu, Wifi, ChevronRight, Quote, ArrowRight
} from "lucide-react";

import type { HospitalAmenityItem, HospitalPublicAbout, HospitalPublicDoctor, HospitalSpecializationItem } from "@/services/HospitalService";

import heroImg1 from "@/assets/hero-hospital-1.jpg";
import heroImg2 from "@/assets/hero-hospital-2.jpg";
import heroImg3 from "@/assets/hero-hospital-3.jpg";
import heroImg4 from "@/assets/hero-hospital-4.jpg";
import heroImg5 from "@/assets/hero-hospital-5.jpg";
import heroImg6 from "@/assets/hero-hospital-6.jpg";
import aboutImg from "@/assets/about-hospital.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-6.jpg";
import doctor3 from "@/assets/doctor-5.jpg";
import doctor4 from "@/assets/doctor-2.jpg";
import maleDoctorImg from "@/assets/male-doctor.png";
import femaleDoctorImg from "@/assets/female-doctor.png";
import patient1 from "@/assets/patient-1.jpg";
import patient2 from "@/assets/patient-2.jpg";
import patient3 from "@/assets/patient-3.jpg";
import patient4 from "@/assets/patient-4.jpg";
import { PaIcons } from "@/components/icons/PaIcons";

const slides = [
  { image: heroImg1, headline: "Innovation in Healthcare", desc: "Transforming patient outcomes through AI-assisted diagnostics and telemedicine.", tag: "🚀 Next-Gen Medicine" },
  { image: heroImg2, headline: "Smart Medical Facilities", desc: "IoT-connected wards and automated patient monitoring systems.", tag: "🏥 Smart Hospital" },
  { image: heroImg3, headline: "Precision Surgery", desc: "Robotic-assisted procedures with unmatched accuracy and faster recovery.", tag: "⚡ Precision Care" },
  { image: heroImg4, headline: "Expert Care Team", desc: "Multidisciplinary teams delivering evidence-based personalized medicine.", tag: "👨‍⚕️ Expert Teams" },
  { image: heroImg5, headline: "Digital Patient Experience", desc: "From booking to follow-up, everything at your fingertips.", tag: "📱 Digital Health" },
  { image: heroImg6, headline: "Research-Driven Care", desc: "Clinical trials and research partnerships advancing medical frontiers.", tag: "🔬 Research Hub" },
];

const departments = [
  { icon: Heart, name: "Cardiology", desc: "AI-powered cardiac monitoring and interventional procedures." },
  { icon: Brain, name: "Neuroscience", desc: "Brain-computer interfaces and advanced neurosurgery." },
  { icon: Bone, name: "Orthopedics", desc: "3D-printed implants and robotic joint replacement." },
  { icon: Baby, name: "Pediatrics", desc: "Child-friendly smart wards with telemedicine support." },
  { icon: ScanLine, name: "Imaging Center", desc: "AI-enhanced imaging with real-time diagnostic reports." },
  { icon: Ambulance, name: "Trauma Center", desc: "Level-1 trauma care with helicopter emergency access." },
];

const doctors = [
  { photo: doctor1, name: "Dr. David Park", spec: "Cardiology & AI Research", exp: "16+ Years" },
  { photo: doctor2, name: "Dr. Amara Hassan", spec: "Neuroscience", exp: "13+ Years" },
  { photo: doctor3, name: "Dr. Chris Evans", spec: "Robotic Surgery", exp: "20+ Years" },
  { photo: doctor4, name: "Dr. Nina Kapoor", spec: "Digital Health", exp: "9+ Years" },
];

const testimonials = [
  { photo: patient1, name: "Alex Turner", review: "The telemedicine follow-up was seamless. I could track my recovery through the patient app in real-time.", rating: 5 },
  { photo: patient2, name: "Patricia Wells", review: "State-of-the-art facilities. The AI diagnostics caught something other hospitals missed. Truly innovative.", rating: 5 },
  { photo: patient3, name: "George Baker", review: "Robotic surgery meant minimal scarring and I was back on my feet in days. Incredible technology here.", rating: 5 },
  { photo: patient4, name: "Mia Chen", review: "The digital patient portal made managing my treatment plan so easy. Modern healthcare at its finest.", rating: 4 },
];

const navLinks = ["Home", "About", "Departments", "Doctors", "Testimonials", "Contact"];

type Props = {
  hospitalName?: string;
  specializations?: HospitalSpecializationItem[];
  doctors?: HospitalPublicDoctor[];
  about?: HospitalPublicAbout | null;
  amenities?: HospitalAmenityItem[];
};

// ─── Hospital 3: Sunrise Healthcare ──────────────────────────
// Design: Bold, geometric, asymmetric grids, teal/coral accents,
// large typography, tech-forward, angular card designs
const LiveTemplate4 = ({ hospitalName, specializations, doctors: publicDoctors, about, amenities }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [tIdx, setTIdx] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const resolvedDepartments = (() => {
    if (specializations && specializations.length > 0) {
      const icons = [Heart, Brain, Bone, Baby, ScanLine, Ambulance, Cpu, Wifi];
      return specializations.map((s, idx) => ({
        icon: icons[idx % icons.length],
        name: String(s.name ?? ""),
        desc: String(s.description ?? ""),
      }));
    }
    return departments;
  })();

  const resolvedAbout = (() => {
    const defaultTitle = "Transforming Healthcare Through Innovation";
    const defaultDesc1 = "Sunrise Healthcare represents a new era of patient-centered medical excellence, where AI meets compassion to deliver transformative care outcomes.";
    const defaultDesc2 = "With a 400-bed smart facility, we serve over 100,000 patients annually using cutting-edge diagnostic AI, robotic surgery, and telemedicine platforms.";

    const hasDynamicAbout = Boolean(
      about && (String(about.about_title ?? "").trim() || String(about.about_description ?? "").trim() || String(about.about_image ?? "").trim()),
    );

    if (!hasDynamicAbout) {
      return { title: defaultTitle, p1: defaultDesc1, p2: defaultDesc2, image: aboutImg };
    }

    const title = String(about?.about_title ?? "").trim() || (hospitalName ? `About ${hospitalName}` : "About");
    const desc = String(about?.about_description ?? "").trim();
    const chunks = desc ? desc.split(/\r?\n\r?\n|\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, 2) : [];
    const p1 = chunks[0] || "";
    const p2 = chunks[1] || "";
    const image = String(about?.about_image ?? "").trim() || aboutImg;
    return { title, p1, p2, image };
  })();

  const resolvedAmenities = (() => {
    const items = Array.isArray(amenities) ? amenities : [];
    return items.filter((a) => Boolean(a?.name)).slice(0, 4);
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
  useEffect(() => { const t = setInterval(nextSlide, 4000); return () => clearInterval(t); }, [nextSlide]);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 4500); return () => clearInterval(t); }, []);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };

  return (
    <div className="font-poppins">
      {/* ── HEADER: Glassmorphism nav ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[hsl(0,0%,100%)]/90 backdrop-blur-lg shadow-md py-2" : "bg-transparent py-4"}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/"><ArrowLeft className={`w-5 h-5 ${scrolled ? "text-[hsl(185,62%,38%)]" : ""}`} style={!scrolled ? { color: "#fff" } : {}} /></Link>
            <div className="flex items-center gap-2">
              <Zap className={`w-7 h-7 ${scrolled ? "text-[hsl(185,62%,38%)]" : ""}`} style={!scrolled ? { color: "#fff" } : {}} />
              <span className={`text-lg font-extrabold tracking-tight ${scrolled ? "text-[hsl(220,20%,15%)]" : ""}`} style={!scrolled ? { color: "#fff" } : {}}>{hospitalName || "SUNRISE"}</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className={`text-sm font-medium hover:opacity-80 ${scrolled ? "text-[hsl(220,20%,15%)]" : ""}`} style={!scrolled ? { color: "#fff" } : {}}>{l}</button>)}
            <button onClick={() => scrollTo("contact")} className="bg-gradient-to-r from-[hsl(185,62%,38%)] to-[hsl(340,65%,55%)] px-6 py-2.5 rounded-lg text-sm font-bold hover:scale-105 transition-transform" style={{ color: "#fff" }}>
              Get Started
            </button>
          </nav>
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className={scrolled ? "text-[hsl(220,20%,15%)]" : ""} style={!scrolled ? { color: "#fff" } : {}} /> : <Menu className={scrolled ? "text-[hsl(220,20%,15%)]" : ""} style={!scrolled ? { color: "#fff" } : {}} />}
          </button>
        </div>
        {mobileMenu && <div className="lg:hidden bg-[hsl(0,0%,100%)] shadow-lg px-4 pb-4">{navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className="block w-full text-left py-2 text-sm text-[hsl(220,20%,15%)] font-medium">{l}</button>)}<button onClick={() => scrollTo("contact")} className="mt-2 w-full bg-gradient-to-r from-[hsl(185,62%,38%)] to-[hsl(340,65%,55%)] px-5 py-2.5 rounded-lg text-sm font-bold" style={{ color: "#fff" }}>Get Started</button></div>}
      </header>

      {/* ── HERO: Full-screen with geometric overlay ── */}
      <section id="home" className="relative h-screen overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <img src={s.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsla(185,62%,15%,0.9), hsla(340,65%,25%,0.6))" }} />
          </div>
        ))}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <span className="inline-block bg-[hsl(0,0%,100%,0.1)] backdrop-blur-sm border border-[hsl(0,0%,100%,0.2)] rounded-lg px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up" style={{ color: "#fff" }}>{slides[slide].tag}</span>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight animate-fade-up" style={{ color: "#fff" }}>{slides[slide].headline}</h1>
              <p className="text-lg md:text-xl mb-8 max-w-lg animate-fade-up-delay-1" style={{ color: "hsl(0,0%,100%,0.8)" }}>{slides[slide].desc}</p>
              <div className="flex gap-4 animate-fade-up-delay-2">
                <button className="bg-gradient-to-r from-[hsl(185,62%,45%)] to-[hsl(340,65%,55%)] px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform" style={{ color: "#fff" }}>Book Appointment</button>
                <button className="border border-[hsl(0,0%,100%,0.3)] backdrop-blur-sm px-6 py-4 rounded-xl font-semibold hover:bg-[hsl(0,0%,100%,0.1)] transition-colors flex items-center gap-2" style={{ color: "#fff" }}>Explore <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
        {/* Progress bar indicators */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`flex-1 h-1 transition-all ${i === slide ? "bg-[hsl(185,62%,55%)]" : "bg-[hsl(0,0%,100%,0.2)]"}`} />
          ))}
        </div>
      </section>

      {/* ── ABOUT: Asymmetric grid with tech stats ── */}
      <section id="about" className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="inline-flex items-center gap-2 bg-[hsl(185,62%,94%)] text-[hsl(185,62%,38%)] px-4 py-1.5 rounded-lg text-sm font-semibold mb-4"><Activity className="w-4 h-4" /> {hospitalName ? `About ${hospitalName}` : "About Sunrise"}</div>
                <h2 className="text-4xl md:text-5xl font-black text-[hsl(220,20%,15%)] leading-tight mb-6">{resolvedAbout.title}</h2>
                {resolvedAbout.p1 ? <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-4">{resolvedAbout.p1}</p> : null}
                {resolvedAbout.p2 ? <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-8">{resolvedAbout.p2}</p> : null}
                <div className="grid grid-cols-2 gap-4">
                  {resolvedAmenities.length > 0
                    ? resolvedAmenities.map((a, i) => {
                        const iconKey = String(a.icon ?? "").trim();
                        const iconSrc = iconKey ? (PaIcons as Record<string, string>)[iconKey] : "";
                        return (
                          <div
                            key={String(a.id ?? i)}
                            className="bg-gradient-to-br from-[hsl(185,62%,96%)] to-[hsl(340,65%,96%)] rounded-xl p-4"
                          >
                            {iconSrc ? (
                              <img src={iconSrc} alt="" className="w-8 h-8 mb-2 object-contain" />
                            ) : (
                              <Activity className="w-8 h-8 text-[hsl(185,62%,38%)] mb-2" />
                            )}
                            <div className="font-bold text-sm text-[hsl(220,20%,15%)]">{a.name}</div>
                            <div className="text-xs text-[hsl(215,16%,47%)]">Available</div>
                          </div>
                        );
                      })
                    : [{ icon: Cpu, label: "AI Diagnostics", desc: "Real-time analysis" }, { icon: Wifi, label: "Telemedicine", desc: "Remote consultations" }].map((f, i) => (
                        <div key={i} className="bg-gradient-to-br from-[hsl(185,62%,96%)] to-[hsl(340,65%,96%)] rounded-xl p-4">
                          <f.icon className="w-8 h-8 text-[hsl(185,62%,38%)] mb-2" />
                          <div className="font-bold text-sm text-[hsl(220,20%,15%)]">{f.label}</div>
                          <div className="text-xs text-[hsl(215,16%,47%)]">{f.desc}</div>
                        </div>
                      ))}
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-7">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
                <img src={resolvedAbout.image} alt="About" className="rounded-2xl shadow-xl w-full" />
                <div className="absolute bottom-4 left-4 right-4 bg-[hsl(0,0%,100%)]/90 backdrop-blur-md rounded-xl p-4 grid grid-cols-4 gap-4">
                  {[{ v: "20+", l: "Years" }, { v: "180+", l: "Doctors" }, { v: "100K+", l: "Patients" }, { v: "28+", l: "Depts" }].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl font-black bg-gradient-to-r from-[hsl(185,62%,38%)] to-[hsl(340,65%,55%)] bg-clip-text text-transparent">{s.v}</div>
                      <div className="text-xs text-[hsl(215,16%,47%)]">{s.l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS: 2-column list layout ── */}
      <section id="departments" className="py-24 bg-[hsl(220,20%,8%)]">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[hsl(185,62%,55%)] font-semibold uppercase tracking-wider text-sm">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ color: "#fff" }}>Specialized Departments</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {resolvedDepartments.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-5 bg-[hsl(0,0%,100%,0.05)] border border-[hsl(0,0%,100%,0.08)] rounded-xl p-5 hover:bg-[hsl(0,0%,100%,0.1)] transition-colors group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(185,62%,38%)] to-[hsl(340,65%,55%)] flex items-center justify-center flex-shrink-0">
                  <d.icon className="w-7 h-7" style={{ color: "#fff" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold" style={{ color: "#fff" }}>{d.name}</h3>
                  <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.6)" }}>{d.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "hsl(185,62%,55%)" }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTORS: Horizontal cards ── */}
      <section id="doctors" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <span className="text-[hsl(185,62%,38%)] font-semibold uppercase tracking-wider text-sm">Our Specialists</span>
              <h2 className="text-3xl md:text-4xl font-black text-[hsl(220,20%,15%)] mt-2">Medical Experts</h2>
            </div>
            <p className="text-[hsl(215,16%,47%)] max-w-md mt-3 md:mt-0">World-class physicians leading innovation in their respective fields.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {resolvedDoctors.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-5 bg-[hsl(0,0%,100%)] rounded-xl border border-[hsl(214,32%,91%)] p-4 hover:shadow-lg transition-all group">
                <img src={d.photo} alt={d.name} className="w-28 h-28 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-[hsl(220,20%,15%)]">{d.name}</h3>
                  <p className="text-sm font-medium bg-gradient-to-r from-[hsl(185,62%,38%)] to-[hsl(340,65%,55%)] bg-clip-text text-transparent">{d.spec}</p>
                  <p className="text-xs text-[hsl(215,16%,47%)] mt-1">{d.exp} Experience</p>
                  <div className="flex gap-2 mt-2">
                    {[Linkedin, Twitter].map((I, j) => <a key={j} href="#" className="w-7 h-7 rounded-md bg-[hsl(185,62%,94%)] flex items-center justify-center hover:bg-[hsl(185,62%,38%)] hover:text-[hsl(0,0%,100%)] transition-colors"><I className="w-3.5 h-3.5 text-[hsl(185,62%,38%)]" /></a>)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS: Large quote + sidebar list ── */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-[hsl(185,62%,96%)] to-[hsl(340,65%,96%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[hsl(185,62%,38%)] font-semibold uppercase tracking-wider text-sm">Reviews</span>
            <h2 className="text-3xl md:text-4xl font-black text-[hsl(220,20%,15%)] mt-2">Patient Experiences</h2>
          </div>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-[hsl(0,0%,100%)] rounded-2xl p-8 md:p-10 shadow-sm">
              <Quote className="w-10 h-10 text-[hsl(185,62%,85%)] mb-4" />
              <p className="text-xl leading-relaxed text-[hsl(220,20%,15%)] mb-6">"{testimonials[tIdx].review}"</p>
              <div className="flex items-center gap-4">
                <img src={testimonials[tIdx].photo} alt="" className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-[hsl(220,20%,15%)]">{testimonials[tIdx].name}</h4>
                  <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < testimonials[tIdx].rating ? "fill-[hsl(45,100%,55%)] text-[hsl(45,100%,55%)]" : "text-[hsl(215,16%,80%)]"}`} />)}</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {testimonials.map((t, i) => (
                <button key={i} onClick={() => setTIdx(i)} className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${i === tIdx ? "bg-[hsl(0,0%,100%)] shadow-md" : "hover:bg-[hsl(0,0%,100%,0.5)]"}`}>
                  <img src={t.photo} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm text-[hsl(220,20%,15%)]">{t.name}</div>
                    <div className="text-xs text-[hsl(215,16%,47%)] truncate max-w-[200px]">{t.review.slice(0, 50)}...</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT: Split diagonal layout ── */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[hsl(185,62%,38%)] font-semibold uppercase tracking-wider text-sm">Reach Out</span>
            <h2 className="text-3xl md:text-4xl font-black text-[hsl(220,20%,15%)] mt-2">Contact Us</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[hsl(185,62%,38%)] to-[hsl(340,65%,55%)] rounded-2xl p-8 md:p-10">
              <h3 className="text-2xl font-bold mb-6" style={{ color: "#fff" }}>Get In Touch</h3>
              <div className="space-y-5">
                {[
                  { icon: MapPin, text: "789 Sunrise Ave, Chicago, IL 60601" },
                  { icon: Phone, text: "+1 (555) 456-7890" },
                  { icon: Mail, text: "info@LiveTemplate4.com" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[hsl(0,0%,100%,0.15)] flex items-center justify-center"><c.icon className="w-5 h-5" style={{ color: "#fff" }} /></div><span className="text-sm" style={{ color: "hsl(0,0%,100%,0.8)" }}>{c.text}</span></div>
                ))}
              </div>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.1!2d-87.63!3d41.88" width="100%" height="180" style={{ border: 0, borderRadius: "0.75rem", marginTop: "1.5rem" }} allowFullScreen loading="lazy" title="Map" />
            </div>
            <div>
              <form onSubmit={e => { e.preventDefault(); alert("Message sent!"); setForm({ name: "", email: "", phone: "", message: "" }); }} className="space-y-4">
                <input type="text" placeholder="Your Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-5 py-4 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(185,62%,38%)] focus:outline-none transition-colors text-sm" />
                <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full px-5 py-4 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(185,62%,38%)] focus:outline-none transition-colors text-sm" />
                <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(185,62%,38%)] focus:outline-none transition-colors text-sm" />
                <textarea placeholder="Your Message" rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required className="w-full px-5 py-4 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(185,62%,38%)] focus:outline-none transition-colors resize-none text-sm" />
                <button type="submit" className="w-full bg-gradient-to-r from-[hsl(185,62%,38%)] to-[hsl(340,65%,55%)] py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2" style={{ color: "#fff" }}><Send className="w-5 h-5" /> Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER: Dark modern ── */}
      <footer className="bg-[hsl(220,20%,8%)] py-14">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4"><Zap className="w-7 h-7 text-[hsl(185,62%,55%)]" /><span className="text-lg font-extrabold tracking-tight" style={{ color: "#fff" }}>{hospitalName || "SUNRISE"}</span></div>
              <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.5)" }}>Transforming healthcare through innovation, research, and patient commitment since 2006.</p>
              <div className="flex gap-3 mt-4">{[Facebook, Twitter, Instagram, Linkedin].map((I, i) => <a key={i} href="#" className="w-8 h-8 rounded-lg bg-[hsl(0,0%,100%,0.05)] flex items-center justify-center hover:bg-[hsl(0,0%,100%,0.1)]"><I className="w-4 h-4" style={{ color: "hsl(0,0%,100%,0.5)" }} /></a>)}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Links</h4>
              <ul className="space-y-2">{navLinks.map(l => <li key={l}><a href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="text-sm" style={{ color: "hsl(0,0%,100%,0.5)" }}>{l}</a></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Departments</h4>
              <ul className="space-y-2">{resolvedDepartments.map(d => <li key={d.name}><span className="text-sm" style={{ color: "hsl(0,0%,100%,0.5)" }}>{d.name}</span></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: "hsl(0,0%,100%,0.5)" }}>
                <p>789 Sunrise Ave, Chicago, IL</p>
                <p>+1 (555) 456-7890</p>
                <p>info@LiveTemplate4.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[hsl(0,0%,100%,0.08)] mt-10 pt-6 text-center">
            <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.3)" }}>© 2026 Sunrise Healthcare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiveTemplate4;
