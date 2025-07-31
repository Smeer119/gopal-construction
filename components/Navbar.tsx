'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    router.push('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RA</span>
            </div>
            <span className="font-semibold text-xl text-black">RoleAuth</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-black transition-colors">
              Home
            </Link>
            {!user ? (
              <>
                <Link href="/login" className="text-gray-700 hover:text-black transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="text-gray-700 hover:text-black transition-colors">
                  Signup
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user.user_metadata?.name || user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-black focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-black transition-colors py-2"
                onClick={closeMenu}
              >
                Home
              </Link>
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-black transition-colors py-2"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-gray-700 hover:text-black transition-colors py-2"
                    onClick={closeMenu}
                  >
                    Signup
                  </Link>
                </>
              ) : (
                <div className="flex flex-col space-y-4">
                  <span className="text-gray-700 py-2">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 w-fit"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}