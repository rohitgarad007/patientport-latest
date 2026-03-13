import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart, Brain, Bone, Baby, ScanLine, Ambulance, Phone, Mail, MapPin,
  ChevronLeft, ChevronRight, Star, Menu, X, Clock, Users, SmilePlus,
  Building2, Send, Linkedin, Twitter, Facebook, Instagram, ArrowLeft,
  Shield, Award, Stethoscope, Activity, Quote
} from "lucide-react";

import heroImg1 from "@/assets/hero-hospital-1.jpg";
import heroImg2 from "@/assets/hero-hospital-2.jpg";
import heroImg3 from "@/assets/hero-hospital-3.jpg";
import heroImg4 from "@/assets/hero-hospital-4.jpg";
import heroImg5 from "@/assets/hero-hospital-5.jpg";
import heroImg6 from "@/assets/hero-hospital-6.jpg";
import aboutImg from "@/assets/about-hospital.jpg";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";
import doctor4 from "@/assets/doctor-4.jpg";
import patient1 from "@/assets/patient-1.jpg";
import patient2 from "@/assets/patient-2.jpg";
import patient3 from "@/assets/patient-3.jpg";
import patient4 from "@/assets/patient-4.jpg";

// ─── Data ──────────────────────────────────────────────────────
const slides = [
  { image: heroImg1, headline: "World-Class Healthcare", desc: "Advanced medical care with cutting-edge technology and compassionate professionals.", cta: "Book Appointment" },
  { image: heroImg2, headline: "Advanced Medical Facilities", desc: "State-of-the-art equipment and modern infrastructure for the best patient experience.", cta: "Learn More" },
  { image: heroImg3, headline: "Expert Surgical Care", desc: "Our skilled surgeons perform complex procedures with precision and care.", cta: "Our Departments" },
  { image: heroImg4, headline: "Compassionate Doctors", desc: "A team of dedicated physicians committed to your health and well-being.", cta: "Meet Our Doctors" },
  { image: heroImg5, headline: "Patient-First Approach", desc: "Comfortable environment designed around your comfort and recovery.", cta: "Book Appointment" },
  { image: heroImg6, headline: "Trusted Medical Team", desc: "Hundreds of specialists working together to deliver outstanding healthcare.", cta: "Contact Us" },
];

const departments = [
  { icon: Heart, name: "Cardiology", desc: "Comprehensive heart care including diagnostics, treatment, and cardiac rehabilitation programs." },
  { icon: Brain, name: "Neurology", desc: "Expert treatment for neurological conditions, brain disorders, and spinal cord injuries." },
  { icon: Bone, name: "Orthopedics", desc: "Advanced bone and joint care from fractures to total joint replacement surgery." },
  { icon: Baby, name: "Pediatrics", desc: "Specialized healthcare for infants, children, and adolescents with gentle care." },
  { icon: ScanLine, name: "Radiology", desc: "Advanced diagnostic imaging services including MRI, CT scans, and ultrasound." },
  { icon: Ambulance, name: "Emergency Care", desc: "24/7 emergency services with rapid response and critical care medical teams." },
];

const doctors = [
  { photo: doctor1, name: "Dr. James Mitchell", spec: "Cardiologist", exp: "15+ Years", desc: "Leading heart specialist with expertise in interventional cardiology and heart surgery." },
  { photo: doctor2, name: "Dr. Sarah Chen", spec: "Neurologist", exp: "12+ Years", desc: "Expert in neurological disorders, stroke management, and brain rehabilitation." },
  { photo: doctor3, name: "Dr. Michael Roberts", spec: "Orthopedic Surgeon", exp: "18+ Years", desc: "Renowned for joint replacement, sports medicine, and trauma surgery." },
  { photo: doctor4, name: "Dr. Emily Patel", spec: "Pediatrician", exp: "10+ Years", desc: "Dedicated to providing compassionate care for children of all ages." },
];

const testimonials = [
  { photo: patient1, name: "Robert Williams", review: "The care I received was exceptional. The doctors and staff were incredibly attentive and professional throughout my entire treatment journey.", rating: 5 },
  { photo: patient2, name: "Maria Garcia", review: "I'm grateful for the outstanding medical team. They made me feel comfortable and well-cared for during a difficult time in my life.", rating: 5 },
  { photo: patient3, name: "David Johnson", review: "World-class facilities and compassionate care. I would highly recommend this hospital to anyone seeking quality healthcare services.", rating: 4 },
  { photo: patient4, name: "Linda Thompson", review: "From admission to discharge, every step was handled with professionalism and genuine care for my well-being and recovery.", rating: 5 },
];

const navLinks = ["Home", "About Us", "Departments", "Doctors", "Testimonials", "Contact"];
const stats = [
  { icon: Clock, value: "25+", label: "Years Experience" },
  { icon: Users, value: "200+", label: "Expert Doctors" },
  { icon: SmilePlus, value: "50K+", label: "Happy Patients" },
  { icon: Building2, value: "30+", label: "Departments" },
];

// ─── Hospital 1: City General ──────────────────────────────────
// Design: Classic clean layout, blue tones, horizontal card layouts,
// centered content, traditional medical feel with rounded cards
const Sampletemplates1 = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const nextSlide = useCallback(() => setSlide(s => (s + 1) % slides.length), []);
  useEffect(() => { const t = setInterval(nextSlide, 5000); return () => clearInterval(t); }, [nextSlide]);
  useEffect(() => { const t = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 4000); return () => clearInterval(t); }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div className="font-poppins">
      {/* ── HEADER: Blue gradient sticky nav ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[hsl(210,80%,45%)]/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" style={{ color: "#fff" }} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[hsl(0,0%,100%,0.2)] flex items-center justify-center">
              <Stethoscope className="w-5 h-5" style={{ color: "#fff" }} />
            </div>
            <span className="text-lg font-bold" style={{ color: "#fff" }}>City General Hospital</span>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#fff" }}>{l}</button>
            ))}
            <button onClick={() => scrollTo("contact")} className="bg-[hsl(0,0%,100%)] text-[hsl(210,80%,45%)] px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">
              Book Appointment
            </button>
          </nav>
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X style={{ color: "#fff" }} /> : <Menu style={{ color: "#fff" }} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="lg:hidden bg-[hsl(210,80%,45%)] px-4 pb-4">
            {navLinks.map(l => <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s/g, "-"))} className="block w-full text-left py-2 text-sm font-medium" style={{ color: "#fff" }}>{l}</button>)}
            <button onClick={() => scrollTo("contact")} className="mt-2 w-full bg-[hsl(0,0%,100%)] text-[hsl(210,80%,45%)] px-5 py-2 rounded-full text-sm font-bold">Book Appointment</button>
          </div>
        )}
      </header>

      {/* ── HERO: Full-width slider with left-aligned text ── */}
      <section id="home" className="relative h-screen overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <img src={s.image} alt={s.headline} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsla(210,80%,25%,0.85), hsla(210,80%,45%,0.4))" }} />
          </div>
        ))}
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <div className="inline-block bg-[hsl(0,0%,100%,0.15)] backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <span className="text-sm font-medium" style={{ color: "#fff" }}>🏥 Trusted Healthcare Since 2001</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight animate-fade-up" style={{ color: "#fff" }}>{slides[slide].headline}</h1>
              <p className="text-lg mb-8 animate-fade-up-delay-1" style={{ color: "hsl(0,0%,100%,0.8)" }}>{slides[slide].desc}</p>
              <div className="flex gap-4 animate-fade-up-delay-2">
                <button className="bg-[hsl(0,0%,100%)] text-[hsl(210,80%,35%)] px-8 py-3.5 rounded-full font-bold text-lg hover:scale-105 transition-transform">{slides[slide].cta}</button>
                <button className="border-2 border-[hsl(0,0%,100%,0.4)] px-8 py-3.5 rounded-full font-semibold hover:bg-[hsl(0,0%,100%,0.1)] transition-colors" style={{ color: "#fff" }}>Watch Video</button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${i === slide ? "w-10 bg-[hsl(0,0%,100%)]" : "w-2 bg-[hsl(0,0%,100%,0.4)]"}`} />
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative -mt-16 z-30">
        <div className="container mx-auto px-4">
          <div className="bg-[hsl(0,0%,100%)] rounded-2xl shadow-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <s.icon className="w-8 h-8 mx-auto mb-2 text-[hsl(210,80%,45%)]" />
                <div className="text-3xl font-extrabold text-[hsl(210,80%,35%)]">{s.value}</div>
                <div className="text-sm text-[hsl(215,16%,47%)]">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT: Two-column with image left, text right ── */}
      <section id="about-us" className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <img src={aboutImg} alt="About us" className="rounded-3xl shadow-xl w-full" />
              <div className="absolute -bottom-6 -right-6 bg-[hsl(210,80%,45%)] rounded-2xl p-6 shadow-lg hidden md:block">
                <div className="text-3xl font-extrabold" style={{ color: "#fff" }}>25+</div>
                <div className="text-sm" style={{ color: "hsl(0,0%,100%,0.8)" }}>Years of Excellence</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[hsl(210,80%,45%)] font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2 mb-6">Committed to Your Health & Well-Being</h2>
              <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-4">City General Hospital has been a cornerstone of community healthcare for over 25 years, providing comprehensive medical services with a commitment to excellence and compassion.</p>
              <p className="text-[hsl(215,16%,47%)] leading-relaxed mb-6">Our state-of-the-art facility houses over 500 beds, 30+ specialized departments, and a team of 200+ skilled doctors dedicated to delivering the highest quality of patient care.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-[hsl(210,80%,95%)] rounded-xl p-4">
                  <Shield className="w-8 h-8 text-[hsl(210,80%,45%)]" />
                  <div>
                    <div className="font-semibold text-sm text-[hsl(220,20%,15%)]">Our Mission</div>
                    <div className="text-xs text-[hsl(215,16%,47%)]">Accessible quality care</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[hsl(160,60%,95%)] rounded-xl p-4">
                  <Award className="w-8 h-8 text-[hsl(160,60%,45%)]" />
                  <div>
                    <div className="font-semibold text-sm text-[hsl(220,20%,15%)]">Our Vision</div>
                    <div className="text-xs text-[hsl(215,16%,47%)]">Trusted healthcare leader</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {["24/7 Emergency", "Advanced Labs", "International Care", "Cashless Insurance"].map((h, i) => (
                  <span key={i} className="bg-[hsl(210,80%,95%)] text-[hsl(210,80%,45%)] px-4 py-1.5 rounded-full text-sm font-medium">✓ {h}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS: 3-column card grid ── */}
      <section id="departments" className="py-24 bg-[hsl(210,30%,97%)]">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[hsl(210,80%,45%)] font-semibold text-sm uppercase tracking-wider">Specialties</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2">Our Departments</h2>
            <div className="w-16 h-1 bg-[hsl(210,80%,45%)] mx-auto mt-4 rounded-full" />
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[hsl(0,0%,100%)] rounded-2xl p-8 shadow-md hover:shadow-xl transition-all group hover:-translate-y-1 border border-[hsl(210,30%,94%)]">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(210,80%,95%)] flex items-center justify-center mb-5 group-hover:bg-[hsl(210,80%,45%)] transition-colors">
                  <d.icon className="w-8 h-8 text-[hsl(210,80%,45%)] group-hover:text-[hsl(0,0%,100%)] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(220,20%,15%)] mb-3">{d.name}</h3>
                <p className="text-[hsl(215,16%,47%)] leading-relaxed text-sm">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCTORS: 4-column vertical cards ── */}
      <section id="doctors" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[hsl(210,80%,45%)] font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2">Expert Doctors</h2>
            <div className="w-16 h-1 bg-[hsl(210,80%,45%)] mx-auto mt-4 rounded-full" />
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[hsl(0,0%,100%)] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
                <div className="relative overflow-hidden">
                  <img src={d.photo} alt={d.name} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(210,80%,25%,0.8)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-3">
                    {[Linkedin, Twitter, Mail].map((Icon, j) => (
                      <a key={j} href="#" className="w-9 h-9 rounded-full bg-[hsl(0,0%,100%,0.2)] flex items-center justify-center hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" style={{ color: "#fff" }} />
                      </a>
                    ))}
                  </div>
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-bold text-[hsl(220,20%,15%)]">{d.name}</h3>
                  <p className="text-[hsl(210,80%,45%)] text-sm font-medium">{d.spec}</p>
                  <p className="text-xs text-[hsl(215,16%,47%)] mt-1">{d.exp} Experience</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS: Centered card carousel ── */}
      <section id="testimonials" className="py-24 bg-[hsl(210,80%,45%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#fff" }}>What Our Patients Say</h2>
            <div className="w-16 h-1 bg-[hsl(0,0%,100%)] mx-auto rounded-full" />
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <Quote className="w-12 h-12 mx-auto mb-6" style={{ color: "hsl(0,0%,100%,0.3)" }} />
            <img src={testimonials[testimonialIdx].photo} alt="" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-[hsl(0,0%,100%,0.3)] object-cover" />
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < testimonials[testimonialIdx].rating ? "fill-[hsl(45,100%,60%)] text-[hsl(45,100%,60%)]" : "text-[hsl(0,0%,100%,0.3)]"}`} />)}
            </div>
            <p className="text-lg italic mb-6 leading-relaxed" style={{ color: "hsl(0,0%,100%,0.9)" }}>"{testimonials[testimonialIdx].review}"</p>
            <h4 className="font-bold text-lg" style={{ color: "#fff" }}>{testimonials[testimonialIdx].name}</h4>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === testimonialIdx ? "w-7 bg-[hsl(0,0%,100%)]" : "bg-[hsl(0,0%,100%,0.3)]"}`} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT: Form left, info+map right ── */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[hsl(210,80%,45%)] font-semibold text-sm uppercase tracking-wider">Get In Touch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(220,20%,15%)] mt-2">Contact Us</h2>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <form onSubmit={e => { e.preventDefault(); alert("Message sent!"); setForm({ name: "", email: "", phone: "", message: "" }); }} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-5 py-3.5 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(210,80%,45%)] focus:outline-none transition-colors" />
                  <input type="email" placeholder="Your Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full px-5 py-3.5 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(210,80%,45%)] focus:outline-none transition-colors" />
                </div>
                <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(210,80%,45%)] focus:outline-none transition-colors" />
                <textarea placeholder="Your Message" rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required className="w-full px-5 py-3.5 rounded-xl border border-[hsl(214,32%,91%)] focus:border-[hsl(210,80%,45%)] focus:outline-none transition-colors resize-none" />
                <button type="submit" className="bg-[hsl(210,80%,45%)] px-8 py-3.5 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2" style={{ color: "#fff" }}>
                  <Send className="w-5 h-5" /> Send Message
                </button>
              </form>
            </div>
            <div>
              <div className="space-y-4 mb-8">
                {[
                  { icon: MapPin, text: "123 Medical Center Drive, New York, NY 10001" },
                  { icon: Phone, text: "+1 (555) 123-4567" },
                  { icon: Mail, text: "info@Sampletemplates1.com" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 bg-[hsl(210,80%,95%)] rounded-xl p-4">
                    <c.icon className="w-6 h-6 text-[hsl(210,80%,45%)]" />
                    <span className="text-[hsl(215,16%,47%)]">{c.text}</span>
                  </div>
                ))}
              </div>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.99!3d40.75" width="100%" height="250" style={{ border: 0, borderRadius: "1rem" }} allowFullScreen loading="lazy" title="Map" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER: 4-column blue background ── */}
      <footer className="bg-[hsl(210,80%,25%)] py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-8 h-8" style={{ color: "#fff" }} />
                <span className="text-lg font-bold" style={{ color: "#fff" }}>City General</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(0,0%,100%,0.6)" }}>Committed to providing exceptional healthcare services with compassion and excellence since 2001.</p>
              <div className="flex gap-3 mt-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((I, i) => <a key={i} href="#" className="w-9 h-9 rounded-lg bg-[hsl(0,0%,100%,0.1)] flex items-center justify-center hover:bg-[hsl(0,0%,100%,0.2)] transition-colors"><I className="w-4 h-4" style={{ color: "#fff" }} /></a>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Quick Links</h4>
              <ul className="space-y-2">{navLinks.map(l => <li key={l}><a href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="text-sm hover:underline" style={{ color: "hsl(0,0%,100%,0.6)" }}>{l}</a></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Departments</h4>
              <ul className="space-y-2">{departments.map(d => <li key={d.name}><span className="text-sm" style={{ color: "hsl(0,0%,100%,0.6)" }}>{d.name}</span></li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#fff" }}>Contact Info</h4>
              <div className="space-y-3 text-sm" style={{ color: "hsl(0,0%,100%,0.6)" }}>
                <p>123 Medical Center Drive, New York, NY 10001</p>
                <p>+1 (555) 123-4567</p>
                <p>info@Sampletemplates1.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[hsl(0,0%,100%,0.1)] mt-12 pt-8 text-center">
            <p className="text-sm" style={{ color: "hsl(0,0%,100%,0.5)" }}>© 2026 City General Hospital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Sampletemplates1;
