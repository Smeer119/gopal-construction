'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
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
  Star
} from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

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

      {/* Additional Features Section */}
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
 
    </div>
  )
}



