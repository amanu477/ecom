import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, ArrowRight, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart } from "@workspace/api-client-react";
import { useSessionId } from "@/hooks/use-session-id";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useClerk, SignInButton, SignUpButton } from "@clerk/react";

const clerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ClerkAuthDesktop() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Hi, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
        </span>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <LogIn className="w-4 h-4" />
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-3 py-1 h-8">
          Register
        </Button>
      </SignUpButton>
    </div>
  );
}

function ClerkAuthMobile({ onClose }: { onClose: () => void }) {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (isSignedIn) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <User className="w-4 h-4" />
          {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
        </p>
        <button
          onClick={() => { signOut(); onClose(); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SignInButton mode="modal">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-base font-serif text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogIn className="w-4 h-4" />
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-base font-serif text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <User className="w-4 h-4" />
          Create account
        </button>
      </SignUpButton>
    </div>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const sessionId = useSessionId();

  const { data: cart } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: ["/api/cart", { sessionId }] } }
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = cart?.itemCount || 0;

  const navLinks = [
    { href: "/products", label: "Shop All" },
    { href: "/products?category=Beauty", label: "Beauty" },
    { href: "/products?category=Skincare", label: "Skincare" },
    { href: "/products?category=Fashion", label: "Fashion" },
    { href: "/products?category=Wellness", label: "Wellness" },
  ];

  return (
    <>
      <div className="bg-primary text-primary-foreground text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span className="inline-block animate-pulse mr-2">●</span>
        Free shipping on all orders over $50. Selling fast!
      </div>
      
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-border/50"
            : "bg-background"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              className="md:hidden p-2 -ml-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                FemmeFlow.
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm uppercase tracking-wider font-medium transition-colors hover:text-primary ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2">
                {clerkAvailable && <ClerkAuthDesktop />}
              </div>

              <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors group">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-bold text-primary-foreground group-hover:bg-accent transition-colors"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background border-r border-border shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                <span className="font-serif text-xl font-bold">Menu</span>
                <button
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between text-lg font-serif border-b border-border/50 pb-4"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
                {clerkAvailable && (
                  <div className="pt-2 border-t border-border">
                    <ClerkAuthMobile onClose={() => setIsMobileMenuOpen(false)} />
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border bg-muted/30">
                <Button asChild className="w-full bg-primary text-primary-foreground">
                  <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>Shop Now</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
