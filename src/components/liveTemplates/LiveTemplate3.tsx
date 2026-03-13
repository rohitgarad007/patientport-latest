import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Brain, Bone, Baby, ScanLine, Ambulance, Phone, Mail, MapPin,
  Star, Menu, X, Send, Linkedin, Twitter, Facebook, Instagram, ArrowLeft,
  Crown, Gem, Shield, Award, Quote, ChevronLeft, ChevronRight
} from "lucide-react";

import heroImg1 from "@/assets/hero-hospital-1.jpg";
import heroImg2 from "@/assets/hero-hospital-2.jpg";
import heroImg3 from "@/assets/hero-hospital-3.jpg";
import heroImg4 from "@/assets/hero-hospital-4.jpg";
import heroImg5 from "@/assets/hero-hospital-5.jpg";
import heroImg6 from "@/assets/hero-hospital-6.jpg";
import luxuryImg from "@/assets/hospital-luxury.jpg";
import doctor1 from "@/assets/doctor-5.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-1.jpg";
import doctor4 from "@/assets/doctor-6.jpg";
import patient1 from "@/assets/patient-1.jpg";
import patient2 from "@/assets/patient-2.jpg";
import patient3 from "@/assets/patient-3.jpg";
import patient4 from "@/assets/patient-4.jpg";

const slides = [
  { image: heroImg1, headline: "Premium Medical Excellence", desc: "Where luxury meets world-class healthcare in an unparalleled setting." },
  { image: heroImg2, headline: "Distinguished Facilities", desc: "Five-star medical suites with concierge healthcare services." },
  { image: heroImg3, headline: "Elite Surgical Team", desc: "Board-certified surgeons performing with precision and artistry." },
  { image: heroImg4, headline: "World-Renowned Physicians", desc: "Internationally acclaimed doctors providing personalized treatment." },
  { image: heroImg5, headline: "Luxury Patient Suites", desc: "Private recovery rooms designed for comfort and healing." },
  { image: heroImg6, headline: "International Healthcare", desc: "Serving distinguished patients from over 40 countries worldwide." },
];

const departments = [
  { icon: Heart, name: "Cardiology", desc: "Premium cardiac care with private catheterization labs." },
  { icon: Brain, name: "Neurology", desc: "Elite neuroscience center with advanced brain mapping." },
  { icon: Bone, name: "Orthopedics", desc: "Luxury rehabilitation and premium joint replacement." },
  { icon: Baby, name: "Maternity", desc: "Five-star birthing suites with concierge midwifery." },
  { icon: ScanLine, name: "Diagnostics", desc: "Private imaging suite with same-day results." },
  { icon: Ambulance, name: "Executive Health", desc: "Comprehensive health screening for executives." },
];

const doctors = [
  { photo: doctor1, name: "Dr. William Sterling", spec: "Chief of Cardiology", exp: "25+ Years" },
  { photo: doctor2, name: "Dr. Elizabeth Howard", spec: "Head of Neuroscience", exp: "20+ Years" },
  { photo: doctor3, name: "Dr. Alexander Wright", spec: "Director of Surgery", exp: "22+ Years" },
  { photo: doctor4, name: "Dr. Sophia Martinez", spec: "Head of Pediatrics", exp: "15+ Years" },
];

const testimonials = [
  { photo: patient1, name: "Jonathan Reed III", review: "The private suite and personalized care made my recovery feel like a five-star retreat. Absolutely unmatched in quality and service.", rating: 5 },
  { photo: patient2, name: "Victoria Ashworth", review: "International standard care with the warmth of a boutique hospital. The concierge team handled everything flawlessly.", rating: 5 },
  { photo: patient3, name: "Charles Wellington", review: "As someone who travels the world for healthcare, Royal Medical Institute stands in a class of its own. Truly premium.", rating: 5 },
  { photo: patient4, name: "Isabella Laurent", review: "The executive health program was thorough, professional, and conducted in the most elegant facility I've ever visited.", rating: 5 },
];

const navLinks = ["Home", "About", "Departments", "Doctors", "Testimonials", "Contact"];

// ─── Hospital 4: Royal Medical Institute ─────────────────────
// Design: Luxury, dark navy with gold accents, elegant serif typography,
// premium cards with borders, sophisticated animations, regal feel
const LiveTemplate3 = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [tIdx, setTIdx] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => { const h = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const nextSlide = useCallback(() => setSlide(s => (s + 1) % slides.length), []);
  useEffect(() => { const t = setInterval(nextSlide, 5500); return () => clearInterval(t); }, [nextSlide]);
  useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 5000); return () => clearInterval(t); }, []);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };
  const gold = "hsl(40,85%,55%)";
  const navy = "hsl(225,55%,18%)";
  const navyDark = "hsl(225,55%,10%)";

  return (
    <div className="font-poppins">
      {/* ── HEADER: Dark elegant nav with gold accents ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? `bg-[${navy}]/98 backdrop-blur-md shadow-xl py-2` : "bg-transparent py-5"}`} style={scrolled ? { backgroundColor: "hsla(225,55%,18%,0.98)" } : {}}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/"><ArrowLeft className="w-5 h-5" style={{ color: gold }} /></Link>
            <Crown className="w-8 h-8" style={{ color: gold }} />
            <div>
              <span className="text-lg font-bold tracking-wider" style={{ color: "#fff" }}>ROYAL</span>
              <span className="block text-[10px] tracking-[0.3em] uppercase" style={{ color: gold }}>Medical Institute</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className="text-sm font-medium tracking-wide hover:opacity-80" style={{ color: "hsl(0,0%,100%,0.8)" }}>{l}</button>)}
            <button onClick={() => scrollTo("contact")} className="px-6 py-2.5 border-2 text-sm font-bold tracking-wider hover:scale-105 transition-transform" style={{ borderColor: gold, color: gold }}>
              APPOINTMENT
            </button>
          </nav>
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X style={{ color: "#fff" }} /> : <Menu style={{ color: "#fff" }} />}</button>
        </div>
        {mobileMenu && <div className="lg:hidden px-4 pb-4" style={{ backgroundColor: navy }}>{navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className="block w-full text-left py-2 text-sm" style={{ color: "hsl(0,0%,100%,0.8)" }}>{l}</button>)}<button onClick={() => scrollTo("contact")} className="mt-2 w-full border-2 px-5 py-2.5 text-sm font-bold tracking-wider" style={{ borderColor: gold, color: gold }}>APPOINTMENT</button></div>}
      </header>

      {/* ── HERO: Cinematic full-screen with overlay + centered text ── */}
      <section id="home" className="relative h-screen overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1200 ${i === slide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <img src={s.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, hsla(225,55%,8%,0.7), hsla(225,55%,8%,0.85))` }} />
          </div>
        ))}
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="mb-8">
              <div className="w-px h-16 mx-auto mb-6" style={{ backgroundColor: gold }} />
              <span className="text-sm tracking-[0.4em] uppercase font-medium animate-fade-up" style={{ color: gold }}>Premium Healthcare Excellence</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-up" style={{ color: "#fff" }}>{slides[slide].headline}</h1>
            <p className="text-lg mb-10 animate-fade-up-delay-1" style={{ color: "hsl(0,0%,100%,0.7)" }}>{slides[slide].desc}</p>
            <div className="flex justify-center gap-4 animate-fade-up-delay-2">
              <button className="px-10 py-4 font-bold text-sm tracking-wider hover:scale-105 transition-transform" style={{ backgroundColor: gold, color: navy }}>BOOK NOW</button>
              <button className="px-10 py-4 border-2 font-bold text-sm tracking-wider hover:scale-105 transition-transform" style={{ borderColor: "hsl(0,0%,100%,0.3)", color: "#fff" }}>LEARN MORE</button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-4">
          {slides.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 transition-all ${i === slide ? "w-8" : ""}`} style={{ backgroundColor: i === slide ? gold : "hsl(0,0%,100%,0.3)", height: "3px", borderRadius: "2px" }} />)}
        </div>
      </section>

      {/* ── ABOUT: Elegant split with gold accents ── */}
      <section id="about" className="py-24" style={{ backgroundColor: "hsl(0,0%,100%)" }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px" style={{ backgroundColor: gold }} />
                <span className="text-sm tracking-[0.3em] uppercase font-medium" style={{ color: gold }}>About Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: navy }}>A Legacy of Medical Excellence</h2>
              <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-4">Royal Medical Institute is a premier healthcare institution offering luxury medical services with an uncompromising commitment to clinical excellence since 1995.</p>
              <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-8">Our elite team of board-certified physicians, combined with world-class infrastructure, ensures every patient receives treatment of the highest international standards.</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, label: "Our Mission", desc: "Premium care, world-class standards" },
                  { icon: Gem, label: "Our Vision", desc: "Gold standard in global healthcare" },
                ].map((f, i) => (
                  <div key={i} className="border-l-2 pl-4" style={{ borderColor: gold }}>
                    <f.icon className="w-6 h-6 mb-2" style={{ color: gold }} />
                    <div className="font-bold text-sm" style={{ color: navy }}>{f.label}</div>
                    <div className="text-xs text-[hsl(215,16%,47%)]">{f.desc}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 mt-10 pt-8 border-t border-[hsl(214,32%,91%)]">
                {[{ v: "30+", l: "Years" }, { v: "250+", l: "Doctors" }, { v: "75K+", l: "Patients" }, { v: "35+", l: "Depts" }].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: gold }}>{s.v}</div>
                    <div className="text-xs text-[hsl(215,16%,47%)]">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative">
                <img src={luxuryImg} alt="Luxury suite" className="w-full rounded-lg shadow-xl" />
                <div className="absolute -bottom-6 -left-6 p-6 shadow-xl hidden md:block" style={{ backgroundColor: navy }}>
                  <Award className="w-8 h-8 mb-2" style={{ color: gold }} />
                  <div className="font-bold" style={{ color: "#fff" }}>JCI Accredited</div>
                  <div className="text-xs" style={{ color: "hsl(0,0%,100%,0.6)" }}>International Standard</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS: Dark background, elegant grid ── */}
      <section id="departments" className="py-24" style={{ backgroundColor: navy }}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
              <span className="text-sm tracking-[0.3em] uppercase" style={{ color: gold }}>Our Specialties</span>
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#fff" }}>Premier Departments</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="border p-8 group hover:border-[hsl(40,85%,55%)] transition-colors text-center" style={{ borderColor: "hsl(0,0%,100%,0.1)" }}>
                <div className="w-16 h-16 mx-auto mb-5 border flex items-center justify-center group-hover:border-[hsl(40,85%,55%)] transition-colors" style={{ borderColor: "hsl(0,0%,100%,0.15)" }}>
                  <d.icon className="w-8 h-8 group-hover:text-[hsl(40,85%,55%)] transition-colors" style={{ color: "hsl(0,0%,100%,0.6)" }} />
                </div>
                <h3 className="font-bold mb-3 tracking-wide" style={{ color: "#fff" }}>{d.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(0,0%,100%,0.5)" }}>{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTORS: Elegant portrait cards ── */}
      <section id="doctors" className="py-24" style={{ backgroundColor: "hsl(0,0%,100%)" }}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
              <span className="text-sm tracking-[0.3em] uppercase" style={{ color: gold }}>Leadership</span>
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: navy }}>Distinguished Physicians</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group">
                <div className="relative overflow-hidden mb-4">
                  <img src={d.photo} alt={d.name} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: `linear-gradient(transparent, ${navy})` }}>
                    <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {[Linkedin, Twitter, Mail].map((I, j) => <a key={j} href="#" className="w-8 h-8 border flex items-center justify-center hover:scale-110 transition-transform" style={{ borderColor: gold }}><I className="w-3.5 h-3.5" style={{ color: gold }} /></a>)}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold" style={{ color: navy }}>{d.name}</h3>
                  <p className="text-sm font-medium" style={{ color: gold }}>{d.spec}</p>
                  <p className="text-xs text-[hsl(215,16%,47%)] mt-1">{d.exp}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS: Elegant single with nav arrows ── */}
      <section id="testimonials" className="py-24" style={{ backgroundColor: "hsl(225,30%,95%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
              <span className="text-sm tracking-[0.3em] uppercase" style={{ color: gold }}>Testimonials</span>
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: navy }}>Distinguished Patients</h2>
          </div>
          <div className="max-w-3xl mx-auto relative">
            <div className="text-center p-8 md:p-12" style={{ backgroundColor: "hsl(0,0%,100%)" }}>
              <img src={testimonials[tIdx].photo} alt="" className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2" style={{ borderColor: gold }} />
              <div className="flex justify-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5" style={{ color: i < testimonials[tIdx].rating ? gold : "hsl(215,16%,85%)", fill: i < testimonials[tIdx].rating ? gold : "none" }} />)}</div>
              <p className="text-lg italic leading-relaxed mb-6 text-[hsl(215,16%,47%)]">"{testimonials[tIdx].review}"</p>
              <div className="w-8 h-px mx-auto mb-4" style={{ backgroundColor: gold }} />
              <h4 className="font-bold" style={{ color: navy }}>{testimonials[tIdx].name}</h4>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => setTIdx(i => (i - 1 + testimonials.length) % testimonials.length)} className="w-12 h-12 border flex items-center justify-center hover:scale-105 transition-transform" style={{ borderColor: gold }}>
                <ChevronLeft style={{ color: gold }} />
              </button>
              <button onClick={() => setTIdx(i => (i + 1) % testimonials.length)} className="w-12 h-12 border flex items-center justify-center hover:scale-105 transition-transform" style={{ borderColor: gold }}>
                <ChevronRight style={{ color: gold }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT: Elegant form with navy sidebar ── */}
      <section id="contact" className="py-24" style={{ backgroundColor: "hsl(0,0%,100%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
              <span className="text-sm tracking-[0.3em] uppercase" style={{ color: gold }}>Contact</span>
              <div className="w-12 h-px" style={{ backgroundColor: gold }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: navy }}>Get In Touch</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-0 overflow-hidden rounded-lg shadow-xl">
            <div className="p-8 md:p-10" style={{ backgroundColor: navy }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: "#fff" }}>Contact Information</h3>
              <div className="space-y-5">
                {[
                  { icon: MapPin, text: "1 Royal Plaza, Beverly Hills, CA 90210" },
                  { icon: Phone, text: "+1 (555) 000-1234" },
                  { icon: Mail, text: "info@royalmedical.com" },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-3"><c.icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: gold }} /><span className="text-sm" style={{ color: "hsl(0,0%,100%,0.7)" }}>{c.text}</span></div>
                ))}
              </div>
              <div className="mt-10">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.1!2d-118.40!3d34.07" width="100%" height="180" style={{ border: 0, borderRadius: "0.5rem" }} allowFullScreen loading="lazy" title="Map" />
              </div>
            </div>
            <div className="lg:col-span-2 p-8 md:p-10 bg-[hsl(0,0%,100%)]">
              <form onSubmit={e => { e.preventDefault(); alert("Message sent!"); setForm({ name: "", email: "", phone: "", message: "" }); }} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-5 py-3.5 border-b-2 border-[hsl(214,32%,91%)] focus:border-[hsl(40,85%,55%)] focus:outline-none bg-transparent transition-colors" />
                  <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full px-5 py-3.5 border-b-2 border-[hsl(214,32%,91%)] focus:border-[hsl(40,85%,55%)] focus:outline-none bg-transparent transition-colors" />
                </div>
                <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-5 py-3.5 border-b-2 border-[hsl(214,32%,91%)] focus:border-[hsl(40,85%,55%)] focus:outline-none bg-transparent transition-colors" />
                <textarea placeholder="Your Message" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required className="w-full px-5 py-3.5 border-b-2 border-[hsl(214,32%,91%)] focus:border-[hsl(40,85%,55%)] focus:outline-none bg-transparent transition-colors resize-none" />
                <button type="submit" className="px-10 py-4 font-bold text-sm tracking-wider hover:scale-105 transition-transform flex items-center gap-2" style={{ backgroundColor: navy, color: gold }}>
                  <Send className="w-4 h-4" /> SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER: Dark navy with gold details ── */}
      <footer className="py-14" style={{ backgroundColor: navyDark }}>
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4"><Crown className="w-7 h-7" style={{ color: gold }} /><div><span className="text-lg font-bold tracking-wider" style={{ color: "#fff" }}>ROYAL</span><span className="block text-[9px] tracking-[0.3em] uppercase" style={{ color: gold }}>Medical Institute</span></div></div>
              <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.4)" }}>Premium healthcare excellence since 1995. Serving distinguished patients worldwide.</p>
              <div className="flex gap-3 mt-4">{[Facebook, Twitter, Instagram, Linkedin].map((I, i) => <a key={i} href="#" className="w-8 h-8 border flex items-center justify-center hover:border-[hsl(40,85%,55%)] transition-colors" style={{ borderColor: "hsl(0,0%,100%,0.1)" }}><I className="w-4 h-4" style={{ color: "hsl(0,0%,100%,0.4)" }} /></a>)}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 tracking-wide" style={{ color: gold }}>Navigation</h4>
              <ul className="space-y-2">{navLinks.map(l => <li key={l}><a href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="text-sm" style={{ color: "hsl(0,0%,100%,0.4)" }}>{l}</a></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 tracking-wide" style={{ color: gold }}>Departments</h4>
              <ul className="space-y-2">{departments.map(d => <li key={d.name}><span className="text-sm" style={{ color: "hsl(0,0%,100%,0.4)" }}>{d.name}</span></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 tracking-wide" style={{ color: gold }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: "hsl(0,0%,100%,0.4)" }}>
                <p>1 Royal Plaza, Beverly Hills, CA</p>
                <p>+1 (555) 000-1234</p>
                <p>info@royalmedical.com</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-10 pt-6 text-center" style={{ borderColor: "hsl(0,0%,100%,0.06)" }}>
            <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.3)" }}>© 2026 Royal Medical Institute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiveTemplate3;
