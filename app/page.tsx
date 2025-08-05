
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
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
  MessageSquare,
  Send,
  X,
  HardHat,
  LayoutGrid,
  ClipboardCheck,
  Truck,
  Building2,
  Landmark,
  CloudLightning
} from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<{text: string; isUser: boolean}[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  const handleHeroClick = () => {
    if (!user) {
      router.push('/signup')
    } else {
      const userType = user.user_metadata?.user_type
      const role = user.user_metadata?.role
      
      if (userType === 'industry' && role) {
        router.push(`/dashboard/${role}`)
      } else {
        router.push('/select-role')
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    
    // Add user message
    const userMessage = { text: inputMessage, isUser: true }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Predefined responses based on keywords
    const userMessageLower = inputMessage.toLowerCase()
    let response = ""
    
    if (userMessageLower.includes('hello') || userMessageLower.includes('hi') || userMessageLower.includes('hey')) {
      response = "Hello! I'm your Construction AI Assistant. How can I help you with your construction project today?"
    } else if (userMessageLower.includes('safety') || userMessageLower.includes('helmet') || userMessageLower.includes('ppe')) {
      response = "For safety on construction sites, always ensure: 1) Wear proper PPE including hard hats, safety boots, and high-visibility vests. 2) Follow all safety protocols and signage. 3) Keep work areas clean and organized. 4) Report any hazards immediately."
    } else if (userMessageLower.includes('schedule') || userMessageLower.includes('timeline')) {
      response = "A typical construction schedule includes: 1) Site preparation (1-2 weeks), 2) Foundation work (2-4 weeks), 3) Framing (4-8 weeks), 4) Mechanical/Electrical/Plumbing (3-6 weeks), 5) Insulation and drywall (2-3 weeks), 6) Interior finishes (4-8 weeks), 7) Final inspections (1-2 weeks). Timelines vary based on project size and complexity."
    } else if (userMessageLower.includes('permit') || userMessageLower.includes('license')) {
      response = "Common construction permits include: 1) Building permit, 2) Electrical permit, 3) Plumbing permit, 4) Mechanical permit, 5) Demolition permit. Always check with your local building department for specific requirements in your area."
    } else if (userMessageLower.includes('cost') || userMessageLower.includes('budget') || userMessageLower.includes('price')) {
      response = "Construction costs vary widely based on location, materials, and labor. As a rough estimate, residential construction can range from $100-$200 per square foot, while commercial projects typically range from $200-$500 per square foot. For an accurate estimate, please provide project details."
    } else if (userMessageLower.includes('material')) {
      response = "Common construction materials include: 1) Concrete, 2) Steel, 3) Wood, 4) Brick/Block, 5) Glass. Consider factors like cost, durability, and local building codes when selecting materials. Sustainable options like recycled materials or energy-efficient products may qualify for tax credits."
    } else if (userMessageLower.includes('thank') || userMessageLower.includes('thanks')) {
      response = "You're welcome! If you have any more questions about construction management, safety, or project planning, feel free to ask!"
    } else {
      response = "I'm here to help with construction-related questions. You can ask me about construction management, safety protocols, project planning, permits, materials, or scheduling. What specific aspect of construction would you like to know more about?"
    }
    
    // Add AI response
    setMessages(prev => [...prev, { text: response, isUser: false }])
    setIsTyping(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const featureVariants = {
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Modern Navbar */}
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
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-10"></div>
        
        {/* Content */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Modern Construction
            </span>
            <br />
            <span className="text-white">Management Simplified</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            From site updates to digital attendance, manage your workforce, materials, 
            and reports — all in one intuitive platform.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
              onClick={handleHeroClick}
              disabled={loading}
            >
              {loading ? 'Loading...' : user ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {!user && (
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-4 text-lg border-white text-white hover:bg-white/10 hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {user && (
              <Link href="/profile">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-4 text-lg"
                >
                  View Profile
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>


      {/* Trusted By Section
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">Trusted by leading firms</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center"
          >
            {['L&T Construction', 'Shapoorji Pallonji', 'GMR Group', 'Tata Projects'].map((company, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center h-20"
              >
                <span className="text-gray-700 font-medium">{company}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Construction Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines powerful tools with intuitive design to streamline your construction operations
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Role-Based Dashboards */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-transparent transition-all group"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-50 group-hover:to-emerald-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Role-Based Dashboards</h3>
              <p className="text-gray-600 leading-relaxed">
                Custom interfaces for every team member with only the tools and data they need
              </p>
            </motion.div>

            {/* Daily Progress Reports */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-transparent transition-all group"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-50 group-hover:to-emerald-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Automated DPRs</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate professional Daily Progress Reports with photos, notes, and analytics
              </p>
            </motion.div>

            {/* Material Management */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-transparent transition-all group"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-50 group-hover:to-emerald-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Material Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track inventory, orders, and consumption with barcode scanning and alerts
              </p>
            </motion.div>

            {/* Workforce Management */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-transparent transition-all group"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-50 group-hover:to-emerald-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Workforce Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Digital attendance, skill tracking, and workforce allocation tools
              </p>
            </motion.div>

            {/* Site Documentation */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-transparent transition-all group"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-50 group-hover:to-emerald-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Site Documentation</h3>
              <p className="text-gray-600 leading-relaxed">
                Capture and organize site photos, notes, and inspections with geotagging
              </p>
            </motion.div>

            {/* Project Scheduling */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-transparent transition-all group"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-50 group-hover:to-emerald-50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Interactive Gantt charts with dependency tracking and milestone alerts
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            {[
              { value: '85%', label: 'Reduction in reporting time' },
              { value: '40%', label: 'Increase in productivity' },
              { value: '99%', label: 'Projects delivered on time' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-8 rounded-xl bg-white/10 backdrop-blur-sm"
              >
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Our Platform Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started quickly and see results immediately
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CloudLightning className="w-8 h-8 text-blue-500" />,
                title: "Setup in Minutes",
                description: "Create your account, invite your team, and connect your projects in just a few clicks."
              },
              {
                icon: <LayoutGrid className="w-8 h-8 text-emerald-500" />,
                title: "Customize Your Dashboard",
                description: "Configure the tools and views each team member needs for their role."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
                title: "Start Tracking Progress",
                description: "Begin documenting progress, materials, and workforce with our intuitive tools."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Client Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Construction teams achieving remarkable results with our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "This platform has transformed how we manage projects. The automated reporting alone saves us 20 hours per week.",
                name: "Rajesh Kumar",
                title: "Project Manager, L&T Construction",
                stars: 5
              },
              {
                quote: "The material tracking system has reduced our waste by 30% and improved accountability across all our sites.",
                name: "Priya Sharma",
                title: "Site Engineer, Shapoorji Pallonji",
                stars: 5
              },
              {
                quote: "Our workforce management is now completely digital and transparent. No more disputes about attendance or hours worked.",
                name: "Amit Patel",
                title: "Contractor, GMR Group",
                stars: 4
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-600 italic mb-6">
                  {testimonial.quote}       
                           </blockquote>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.title}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold mb-6"
            >
              Ready to Revolutionize Your Construction Management?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
            >
              Join hundreds of construction teams achieving better results with our platform
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-6 text-l  text-white bg-white/10 "
                >
                  Request Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>


            
    <footer className="w-full bg-black py-12 text-white">
      <div className=" mx-auto flex w-full flex-col items-start justify-between px-6 md:flex-row md:px-12">
        {/* Left Section - Logo & Copyright */}
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BA</span>
            </div>
            <span className="font-semibold text-xl text-black">BuildKaam</span>
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
 




      {/* AI Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowChat(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 0, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, x: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[calc(100%-2rem)] sm:w-96 h-[70vh] max-h-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 border border-gray-200"
            style={{
              maxWidth: 'calc(100% - 2rem)',
              right: '1rem',
              left: 'auto'
            }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <HardHat className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg">Construction AI Assistant</h3>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <HardHat className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium mb-1">Hi! I'm your Construction AI Assistant</p>
                  <p className="text-sm">Ask me anything about construction management, safety protocols, or project planning</p>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] sm:max-w-md rounded-lg px-4 py-2 ${message.isUser ? 'bg-blue-500 text-white ml-auto' : 'bg-white text-gray-800 border border-gray-200'}`}
                      >
                        {message.text}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <button 
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
