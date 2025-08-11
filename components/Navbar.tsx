

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      if (data) setProfile(data)
    } else {
      setProfile(null)
    }
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
            <Image src="/logo.png" alt="BuildKaam" width={36} height={36} className="rounded-md" />
            <span className="font-semibold text-xl text-black">BuildKaam</span>
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
                <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:underline transition-colors">
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={user.user_metadata?.name || user.email}
                      className="h-8 w-8 rounded-full object-cover border"
                    />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium border">
                      {(user.user_metadata?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  )}
                  <span>{user.user_metadata?.name || user.email}</span>
                </Link>
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
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-700 py-2 hover:underline transition-colors"
                    onClick={closeMenu}
                  >
                    {profile?.profile_photo_url ? (
                      <img
                        src={profile.profile_photo_url}
                        alt={user.user_metadata?.name || user.email}
                        className="h-8 w-8 rounded-full object-cover border"
                      />
                    ) : (
                      <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium border">
                        {(user.user_metadata?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </span>
                    )}
                    <span>{user.user_metadata?.name || user.email}</span>
                  </Link>
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