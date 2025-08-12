'use client'

import {  useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTASection } from "@/components/cta-with-glow"

import { 
  ArrowRight, 
  Shield, 
  Users, 
  Settings, 
  FileText, 
  Package, 
  Clock, 
  Camera, 
  Calendar,
  BarChart3,
  CheckCircle,
  Wrench,
  MapPin,
  Phone,
  Mail,
  Star,
  MessageCircle,
  Send,
  X,
  Loader2
} from 'lucide-react'
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { CardCarousel } from "@/components/ui/card-carousel"
import { HeroSection } from "@/components/hero-section"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const images = [
  { src: "/card/1.png", alt: "Image 1" },
  { src: "/card/2.png", alt: "Image 2" },
  { src: "/card/3.png", alt: "Image 3" },
];

const services = [
  {
    id: 'ai-saas',
    title: 'Ai/Saas/CMS/Cloud/iOT Services',
    description: 'Smart digital solutions for construction management and automation.',
    points: [
      'Ai Construction Management Tools',
      'Ai Work Scheduling',
      'Ai Material Procurement',
      'Ai Estimating',
      'Ai BOQ',
      'Ai Vastu',
      'Ai Monitoring'
    ],
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'pre-construction',
    title: 'Pre-Construction & Site Preparation',
    description: 'Prepare your site for successful construction.',
    points: [
      'Surveying & Marking',
      'Site Clearance',
      'Earthworks',
      'Dewatering',
      'Ground Improvement'
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'planning-design',
    title: 'Planning & Design',
    description: 'Comprehensive design and planning services.',
    points: [
      'Layout',
      'Concept/Schematic/Detailed Design',
      '3D Modeling & Rendering',
      'Interior Design',
      'Structural Design',
      'MEP Design',
      'Infrastructure Design',
      'Sustainable/Green Building Design',
      'Facade Design'
    ],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'project-management',
    title: 'Project Management & Coordination',
    description: 'Efficient project management and coordination.',
    points: [
      'Project Coordinators',
      'Scheduling',
      'Construction Management (Hybrid)',
      'Remote Site Monitoring'
    ],
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80'
  },
  {
    id: 'site-monitoring',
    title: 'Site Monitoring & Progress Tracking',
    description: 'Track progress and ensure quality on site.',
    points: [
      'Project Coordinators',
      'Scheduling',
      'Construction Management (Hybrid)',
      'Remote Site Monitoring',
      'Quality Inspection',
      'Site Safety Management'
    ],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'costing-estimation',
    title: 'Costing & Estimation',
    description: 'Accurate cost estimation and BOQ preparation.',
    points: [
      'Quantity Surveying',
      'BOQ Preparation',
      'Cost Engineering'
    ],
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2031&q=80'
  },
  {
    id: 'tendering-contracts',
    title: 'Tendering & Contracts',
    description: 'Professional tendering and contract management.',
    points: [
      'Quantity Surveying',
      'BOQ Preparation',
      'Cost Engineering'
    ],
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80'
  },
  {
    id: 'structural-works',
    title: 'Structural Works',
    description: 'Robust structural construction services.',
    points: [
      'RCC Works',
      'Concrete Works',
      'Masonry Works',
      'Brickwork & Plastering',
      'UCR / Stone / Plum Concrete Works',
      'Rebaring',
      'Scaffolding Erection & Dismantling',
      'PEB Structure Erection',
      'Retrofitting & Strengthening'
    ],
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2031&q=80'
  },
  {
    id: 'finishing-works',
    title: 'Finishing Works',
    description: 'High-quality finishing for your project.',
    points: [
      'Flooring Installation',
      'Tiling & Grouting',
      'Painting',
      'Waterproofing',
      'ACP Sheeting Installation',
      'Glass Installation',
      'Carpentry & Furniture Installation',
      'Ceiling Works'
    ],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'mep-utilities',
    title: 'MEP & Utilities Installation',
    description: 'Expert installation of MEP and utilities.',
    points: [
      'Plumbing Works',
      'Electrical works',
      'Fire Safety System Installation',
      'Lift installation',
      'HVAC',
      'STP/WTP Plant Installation',
      'Mechanical Fabrication & Erection'
    ],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 'demolition-hse',
    title: 'Demolition, Breaking & Core Works',
    description: 'Safe demolition and HSE documentation.',
    points: [
      'Health, Safety & Environmental (HSE) Documentation'
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  }
];

const features = [
  {
    title: "Role-Based Dashboards",
    description: "Tailored views for Admins, Engineers, Contractors, and Workers with personalized access and functionality",
    icon: <Users className="w-10 h-10 text-white" />,
  },
  {
    title: "Daily Progress Reports (DPR)",
    description: "Fill and download DPRs instantly as PDFs with automated data collection and professional formatting",
    icon: <FileText className="w-10 h-10 text-white" />,
  },
  {
    title: "Material Management",
    description: "Track site materials with real-time data, inventory control, and full accountability chain",
    icon: <Package className="w-10 h-10 text-white" />,
  },
  {
    title: "Online Worker Attendance",
    description: "Mark daily attendance with a click — no paperwork required, with GPS tracking and time logs",
    icon: <Clock className="w-10 h-10 text-white" />,
  },
  {
    title: "Live Site Updates",
    description: "Stay informed with automated updates to the Admin including photos, progress notes, and alerts",
    icon: <Camera className="w-10 h-10 text-white" />,
  },
  {
    title: "Project Scheduling",
    description: "Manage timelines, assign tasks, and track project stages with Gantt charts and milestone tracking",
    icon: <Calendar className="w-10 h-10 text-white" />,
  }
];

const ServicesSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length);
      if (scrollContainerRef.current) {
        const slideWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
        const gap = 24;
        scrollContainerRef.current.scrollTo({
          left: ((currentSlide + 1) % services.length) * (slideWidth + gap),
          behavior: 'smooth'
        });
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 24;
      scrollContainerRef.current.scrollTo({
        left: index * (slideWidth + gap),
        behavior: 'smooth'
      });
    }
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    const next = currentSlide === services.length - 1 ? 0 : currentSlide + 1;
    scrollToSlide(next);
  };

  const prevSlide = () => {
    const prev = currentSlide === 0 ? services.length - 1 : currentSlide - 1;
    scrollToSlide(prev);
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-800 max-w-3xl mx-auto font-medium">
            Need construction help? Ping us.
          </p>
        </div>
        <div className="relative">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4" ref={scrollContainerRef}>
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`min-w-[300px] sm:min-w-[350px] lg:min-w-[400px] p-4 snap-center transition-transform duration-300 relative`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  transform: index === currentSlide ? 'scale(1.08)' : 'scale(0.95)',
                  opacity: index === currentSlide ? 1 : 0.7,
                  zIndex: index === currentSlide ? 2 : 1,
                  boxShadow: index === currentSlide
                    ? '0 0 0 4px #a3e635, 0 8px 32px rgba(0,0,0,0.12)'
                    : '0 2px 12px rgba(0,0,0,0.08)'
                }}
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden relative h-full flex flex-col">
                  <div className="relative">
                    <img
                      src={service.image}
                      alt={service.title}
                      width={400}
                      height={250}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className={`absolute inset-0 flex items-center justify-center`}>
                      <h3 className={`text-xl font-bold text-gray-900 text-center px-2 transition-colors duration-300 ${index === currentSlide ? 'text-lime-700' : 'text-gray-900'}`}>
                        {service.title}
                      </h3>
                    </div>
                    {/* Navigation Buttons on Card */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={nextSlide}
                        className="p-2 rounded-full bg-black text-white shadow-md hover:bg-gray-800 transition-colors"
                        aria-label="Next Slide"
                        tabIndex={-1}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-2">
                      <button
                        onClick={prevSlide}
                        className="p-2 rounded-full bg-black text-white shadow-md hover:bg-gray-800 transition-colors"
                        aria-label="Previous Slide"
                        tabIndex={-1}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-gray-900 text-sm mb-4 font-semibold">
                      {service.description}
                    </p>
                    <ul
                      className={`transition-all duration-300 ${
                        hovered === index || index === currentSlide ? 'opacity-100' : 'opacity-80'
                      }`}
                    >
                      {service.points.map((point, idx) => (
                        <li
                          key={idx}
                          className="text-gray-800 text-sm mb-2 flex items-start font-medium"
                        >
                          <span className="w-2 h-2 bg-lime-400 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Removed horizontal line/dots navigation below the cards */}
      </div>
    </div>
  );
};

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // AI Chatbot state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hi! I am your construction assistant. Ask me anything related to DPR, BOQ, materials, scheduling, safety, and more.' }
  ])

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    // Remove redirect here so user stays on landing page after login/signup
    // Do NOT call router.push('/') here
  };

  const handleHeroClick = () => {
    if (!user) {
      router.push('/signup');
    } else {
      // After login, stay on landing page (do not redirect to dashboard)
      // Optionally, you can show a toast or message
    }
  };

  // Animation state for features section
  const featuresRef = useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!featuresRef.current) return;
      const rect = featuresRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        setFeaturesVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Use HeroSection for hero area, keep all logic and content as is */}
      <HeroSection
        badge={{
          text: "Skip The Paperwork. Let's BUILDKAAM. ",
          action: {
            text: "Learn more",
            href: "/",
          },
        }}
        title="Empowering Construction Teams with Smart Dashboards"
        description="From site updates to digital attendance, manage your workforce, materials, and reports — all in one platform."
        actions={[
          // Dashboard button logic
          user && {
            text: "Dashboard",
            href: "/select-role", // Always redirect to /select-role
            variant: "default",
            icon: <ArrowRight className="ml-2 w-5 h-5" />,
          },
          // Profile button logic
          user && {
            text: "Profile",
            href: "/profile",
            variant: "default",
            icon: <Users className="ml-2 w-5 h-5" />,
          },
          // If not logged in, show Get Started and Sign In
          !user && {
            text: loading ? 'Loading...' : 'Get Started',
            href: "/signup",
            variant: "default",
            icon: <ArrowRight className="ml-2 w-5 h-5" />,
          },
          !user && {
            text: "Sign In",
            href: "/login",
            variant: "glow",
            icon: <MessageCircle className="h-5 w-5" />,
          },
        ].filter(Boolean)}
        image={{
          light: "/video-preview.png",
          dark: "/video-preview.png",
          alt: "Construction Dashboard Preview",
        }}
      />
      {/* <section className="relative overflow-hidden h-screen flex items-center">
        {/* Video Background }
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Dark Overlay }
        <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
        
        {/* Content }
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Empowering Construction Teams
            <br />
            <span className="text-white-300">with Smart Dashboards</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
            From site updates to digital attendance, manage your workforce, materials, 
            and reports — all in one platform.
          </p>
          
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <Button 
    size="lg" 
    className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg"
    onClick={handleHeroClick}
    disabled={loading}
  >
    {loading ? 'Loading...' : user ? 'Go to Dashboard' : 'Get Started'}
    <ArrowRight className="ml-2 w-5 h-5" />
  </Button>

  {!user && (
    <Link href="/login">
      <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
        Sign In
      </Button>
    </Link>
  )}

  {user && (
    <Link href="/profile">
      <Button 
        size="lg" 
        className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg"
      >
        View Profile
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </Link>
  )}
</div>

        </div>
      </section> */}

      {/* Features Section with animated text */}
      <section className="py-20 bg-white">
        <div
          ref={featuresRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              featuresVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Everything You Need to Manage Construction Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your construction operations with our comprehensive suite of tools designed for modern construction teams
            </p>
          </div>

          {/* CardCarousel for features */}
          <div className="mb-12">
            <CardCarousel
              images={features}
              autoplayDelay={2500}
              showPagination={true}
              showNavigation={true}
            />
          </div>

          </div>
      </section>

      {/* Floating AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen && (
          <Button onClick={() => setChatOpen(true)} className="rounded-full h-12 w-12 p-0 shadow-lg">
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
        {chatOpen && (
          <div className="w-[340px] sm:w-[380px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-black text-white">
              <div className="font-semibold">Construction Assistant</div>
              <button onClick={() => setChatOpen(false)} aria-label="Close" className="opacity-80 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={m.role === 'assistant' ? 'text-sm text-gray-800' : 'text-sm text-black'}>
                  {m.role === 'assistant' ? (
                    <div className="bg-gray-100 p-3 rounded-lg whitespace-pre-wrap">
                      {m.content}
                    </div>
                  ) : (
                    <div className="bg-black text-white p-3 rounded-lg whitespace-pre-wrap ml-auto max-w-[85%]">
                      {m.content}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="text-sm text-gray-800">
                  <div className="bg-gray-100 p-3 rounded-lg inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              {/* Contextual CTAs based on last user message */}
              {(() => {
                const lastUser = [...chatMessages].reverse().find(m => m.role === 'user')
                if (!lastUser) return null
                const q = lastUser.content.toLowerCase()

                const has = (...keys: string[]) => keys.some(k => q.includes(k))
                const actions: Array<{ label: string; href: string }> = []

                // DPR / Daily
                if (has('dpr', 'daily report', 'daily', 'report', 'how to fill dpr')) {
                  actions.push({ label: 'Go to Daily (Contractor DPR)', href: '/dashboard/contractor/daily' })
                  actions.push({ label: 'Go to Engineer DPR', href: '/engineer/dpr' })
                }

                // Materials (account for typos: materila, mater4ial, material)
                if (has('material', 'materila', 'mater4ial', 'materials')) {
                  actions.push({ label: 'Go to Material Management', href: '/dashboard/contractor/material-management' })
                }

                // Scheduling (typos too)
                if (has('schedule', 'scheduling', 'seheduling', 'schedulling')) {
                  actions.push({ label: 'Go to Engineer Scheduling', href: '/engineer/scheduling' })
                }

                // Forecasting
                if (has('forecast', 'forecasting', 'plan ahead')) {
                  actions.push({ label: 'Go to Engineer Forecasting', href: '/engineer/forecasting' })
                }

                // Reports
                if (has('admin', 'pdf', 'reports', 'report list', 'my reports')) {
                  actions.push({ label: 'Go to Admin Reports', href: '/dashboard/admin' })
                  actions.push({ label: 'Go to My Reports', href: '/dashboard/my-reports' })
                }

                // Dashboards and four cards
                if (has('contractor', 'four cards', 'fourcards', 'cards', 'dashboard contractor')) {
                  actions.push({ label: 'Go to Contractor Dashboard', href: '/dashboard/contractor' })
                }
                if (has('engineer', 'dashboard engineer')) {
                  actions.push({ label: 'Go to Engineer Dashboard', href: '/dashboard/engineer' })
                }
                if (has('worker', 'attendance', 'mark attendance')) {
                  actions.push({ label: 'Go to Worker Dashboard', href: '/dashboard/worker' })
                }
                if (has('admin dashboard', 'admin panel')) {
                  actions.push({ label: 'Go to Admin Dashboard', href: '/dashboard/admin' })
                }

                // Auth/profile
                if (has('login', 'signin', 'sign in')) {
                  actions.push({ label: 'Sign In', href: '/login' })
                }
                if (has('signup', 'sign up', 'register')) {
                  actions.push({ label: 'Sign Up', href: '/signup' })
                }
                if (has('profile', 'my profile', 'account')) {
                  actions.push({ label: 'Go to Profile', href: '/profile' })
                }

                if (actions.length === 0) return null
                return (
                  <div className="pt-2 border-t mt-2">
                    <div className="text-xs text-gray-500 mb-2">Quick actions</div>
                    <div className="flex flex-wrap gap-2">
                      {actions.map((a, i) => (
                        <Link key={i} href={a.href} className="text-xs">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            {a.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
            <form
              className="flex items-center gap-2 p-3 border-t bg-white"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!chatInput.trim() || chatLoading) return
                const userMsg = chatInput.trim()
                setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
                setChatInput('')
                setChatLoading(true)
                try {
                  // Build full conversation for better context (server will add system)
                  const convo = [...chatMessages, { role: 'user' as const, content: userMsg }]
                  const resp = await fetch('/api/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: convo }),
                  })
                  const text = await resp.text()
                  let data: any
                  try { data = JSON.parse(text) } catch { data = undefined }
                  if (!resp.ok) {
                    let errMsg = (data?.error || 'AI error') + (data?.details ? `\n\nDetails: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}` : '')
                    if (String(errMsg).toLowerCase().includes('api key is not configured')) {
                      errMsg = 'AI is not configured yet. Please set your API key in .env.local (e.g., OPENAI_API_KEY or AI_PROVIDER-specific key) and restart the app.'
                    }
                    setChatMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
                  } else {
                    const content = data?.content || 'No response.'
                    setChatMessages(prev => [...prev, { role: 'assistant', content }])
                  }
                } catch (err: any) {
                  setChatMessages(prev => [...prev, { role: 'assistant', content: 'There was an error contacting the AI service.' }])
                } finally {
                  setChatLoading(false)
                }
              }}
            >
              <input
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ask construction questions…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button type="submit" disabled={chatLoading} className="px-3">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Benefits Section */}
    <section
      className={cn(
        "bg-gradient-to-r from-yellow-50 via-yellow to-white",
        "py-12 sm:py-16 lg:py-20"
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto",
          "px-4 sm:px-6 lg:px-8",
          "grid lg:grid-cols-2 gap-10 items-center"
        )}
      >
        {/* Left Card */}
        <div
          className={cn(
            "bg-white shadow-lg",
            "rounded-[40px] rounded-tr-[100px]",
            "overflow-hidden"
          )}
        >
          <Image
            src="https://cdn.dribbble.com/userupload/24792261/file/original-e1cd05e5820d18153a471277c9bf8c46.jpg?resize=1024x768&vertical=center" // Replace with your image path
            alt="Building"
            width={800}
            height={900}
            className={cn("w-full h-auto object-cover")}
          />
        </div>

        {/* Right: Content */}
        <div>
          <div className="mb-4">
            <span
              className={cn(
                "text-xs font-medium tracking-widest uppercase",
                "border px-3 py-1 rounded-full"
              )}
            >
              Why Choose Us
            </span>
          </div>

          <h2 className={cn("text-3xl sm:text-4xl font-bold mb-4")}>
            What makes us <br /> different
          </h2>

          <p className={cn("text-gray-500 mb-8 max-w-lg")}>
            It's not about creating something good, it's about designing,
            innovating, and collaborating to forge unparalleled experiences.
          </p>

          <div className="space-y-6">
            {[
              "Corporate responsibility",
              "Experts with team spirits",
              "Diversity, equality & inclusion",
            ].map((title, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={cn("bg-lime-300 p-3 rounded-full")}>
                    <ThumbsUp className="w-6 h-6 text-black" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-gray-500 text-sm">
                    Our goal is zero incidents and our lost time frequency rate
                    is industry leading.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Our Services FAQ-style Accordion */}
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-black mb-8 text-center">
          Our Services
        </h2>
        <Accordion type="single" collapsible>
          {services.map((service) => (
            <AccordionItem key={service.id} value={service.id}>
              <AccordionTrigger className="text-lg font-semibold">
                {service.title}
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2 text-gray-700 font-medium">{service.description}</p>
                <ul className="list-disc pl-6 text-gray-600">
                  {service.points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

      {/* Pricing Section */}
    

      {/* CTA Section */}
      <CTASection
      title="Start building today"
      action={{
        text: "Get Started",
        href: "/login",
        variant: "default"
      }}
    />

 
 
  <footer className="w-full bg-black py-12 text-white">
      <div className=" mx-auto flex w-full flex-col items-start justify-between px-6 md:flex-row md:px-12">
        {/* Left Section - Logo & Copyright */}
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="BuildKaam" width={36} height={36} className="rounded-md" />
            <span className="font-semibold text-xl text-white">BuildKaam</span>
          </Link>

        {/* Right Section - Footer Links */}
        <div className="mt-8 grid grid-cols-2 gap-10 text-gray-400 md:mt-0 md:grid-cols-4">
          {/* Pages */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Pages</h3>
            <ul className="text-gray-500">
              <li>
                <a href="/" className="hover:text-gray-400">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-400">
                  Features
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-400">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-400">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Social</h3>
            <ul className="space-y-1">
              <li>
                <a href="/" className="hover:text-gray-200">
                  Instagram
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-200">
                  Discord
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-200">
                  Youtube
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-200">
                  X
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Legal</h3>
            <ul className="space-y-1">
              <li>
                <a href="/" className="hover:text-gray-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-200">
                  Terms and Services
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-200">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Watermark Text */}
      <div
        className="mt-8 bg-gradient-to-t from-black to-gray-400 bg-clip-text text-center 
                text-9xl font-bold tracking-widest text-transparent opacity-40"
      >
       BUILD KAAM
      </div>
    </footer>
 
    </div>
  )
}