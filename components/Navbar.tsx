"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

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
    router.push("/")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className={`flex justify-center w-full py-6 px-4 fixed top-0 z-50 transition-all duration-300 ${isMenuOpen ? 'bg-white' : 'bg-transparent'}`}>
      <div className={`flex items-center justify-between px-6 py-3 ${isMenuOpen ? 'bg-white' : 'bg-white/90 backdrop-blur-sm'} rounded-full shadow-lg w-full max-w-7xl relative z-10 transition-all duration-300`}>
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BA</span>
          </div>
          <span className="font-semibold text-xl text-black">BuildKaam</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/" className="text-gray-700 hover:text-black transition-colors">
              Home
            </Link>
          </motion.div>

          {!user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/login" className="text-gray-700 hover:text-black transition-colors">
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/signup" className="text-gray-700 hover:text-black transition-colors">
                  Signup
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-4">
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
            </motion.div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          {isMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-40 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-gray-900" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Link href="/" className="text-base text-gray-900 font-medium" onClick={toggleMenu}>
                  Home
                </Link>
              </motion.div>
              {!user ? (
                <>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Link href="/login" className="text-base text-gray-900 font-medium" onClick={toggleMenu}>
                      Login
                    </Link>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Link href="/signup" className="text-base text-gray-900 font-medium" onClick={toggleMenu}>
                      Signup
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <span className="text-gray-700 py-2">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Button
                      onClick={() => { toggleMenu(); handleSignOut() }}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 w-fit"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
