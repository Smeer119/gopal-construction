'use client'

import {  useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden h-screen flex items-center">
        {/* Video Background */}
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
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
        
        {/* Content */}
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
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Everything You Need to Manage Construction Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your construction operations with our comprehensive suite of tools designed for modern construction teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Role-Based Dashboards */}
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Role-Based Dashboards</h3>
              <p className="text-gray-600 leading-relaxed">
                Tailored views for Admins, Engineers, Contractors, and Workers with personalized access and functionality
              </p>
            </div>

            {/* Daily Progress Reports */}
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Daily Progress Reports (DPR)</h3>
              <p className="text-gray-600 leading-relaxed">
                Fill and download DPRs instantly as PDFs with automated data collection and professional formatting
              </p>
            </div>

            {/* Material Management */}
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Material Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track site materials with real-time data, inventory control, and full accountability chain
              </p>
            </div>

            {/* Online Worker Attendance */}
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Online Worker Attendance</h3>
              <p className="text-gray-600 leading-relaxed">
                Mark daily attendance with a click — no paperwork required, with GPS tracking and time logs
              </p>
            </div>

            {/* Live Site Updates */}
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Live Site Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay informed with automated updates to the Admin including photos, progress notes, and alerts
              </p>
            </div>

            {/* Project Scheduling */}
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Project Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage timelines, assign tasks, and track project stages with Gantt charts and milestone tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Insert ServicesSection as a component */}
      <ServicesSection />

      {/* More Powerful Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              More Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced tools to optimize every aspect of your construction management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <BarChart3 className="w-10 h-10 text-black mx-auto mb-4" />
              <h4 className="font-semibold text-black mb-2">Analytics & Reports</h4>
              <p className="text-sm text-gray-600">Comprehensive project analytics and custom reporting</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Shield className="w-10 h-10 text-black mx-auto mb-4" />
              <h4 className="font-semibold text-black mb-2">Safety Management</h4>
              <p className="text-sm text-gray-600">Safety protocols, incident reporting, and compliance tracking</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Wrench className="w-10 h-10 text-black mx-auto mb-4" />
              <h4 className="font-semibold text-black mb-2">Equipment Tracking</h4>
              <p className="text-sm text-gray-600">Monitor equipment usage, maintenance, and availability</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <MapPin className="w-10 h-10 text-black mx-auto mb-4" />
              <h4 className="font-semibold text-black mb-2">GPS Tracking</h4>
              <p className="text-sm text-gray-600">Real-time location tracking for workers and equipment</p>
            </div>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6">
                Why Construction Teams Choose Our Platform
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-black mb-1">Reduce Administrative Time by 60%</h4>
                    <p className="text-gray-600">Automate reports, attendance, and documentation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-black mb-1">Improve Project Visibility</h4>
                    <p className="text-gray-600">Real-time updates and comprehensive dashboards</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-black mb-1">Enhance Team Communication</h4>
                    <p className="text-gray-600">Centralized communication and instant notifications</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-black mb-1">Ensure Compliance</h4>
                    <p className="text-gray-600">Built-in safety protocols and regulatory compliance</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center mb-6">
                <div className="flex justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4">
                  "This platform has transformed how we manage our construction projects. 
                  The DPR feature alone saves us hours every day."
                </p>
                <div className="font-semibold text-black">- Project Manager, ABC Construction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
    

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Construction Management?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join hundreds of construction teams already using our platform to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
           
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-black mb-4" />
              <h4 className="font-semibold text-black mb-2">Call Us</h4>
              <p className="text-gray-600">+91 98765 43210</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 text-black mb-4" />
              <h4 className="font-semibold text-black mb-2">Email Us</h4>
              <p className="text-gray-600">support@constructionapp.com</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-black mb-4" />
              <h4 className="font-semibold text-black mb-2">Visit Us</h4>
              <p className="text-gray-600">Bengaluru, Karnataka, India</p>
            </div>
          </div>
        </div>
      </section>

 
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