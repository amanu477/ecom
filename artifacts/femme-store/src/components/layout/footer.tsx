import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 md:py-16 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1 space-y-4">
            <Link href="/">
              <span className="font-serif text-2xl font-bold tracking-tight inline-block">
                FemmeFlow.
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Curated viral products for the modern, trendsetting woman. Discover what's hot before it hits the mainstream.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Shop</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=Beauty" className="hover:text-white transition-colors">Beauty</Link></li>
              <li><Link href="/products?category=Fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=Lifestyle" className="hover:text-white transition-colors">Lifestyle</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/strategy" className="hover:text-white transition-colors">Dropshipping Strategy</Link></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">About Us</span></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">Contact</span></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">FAQ</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="hover:text-white transition-colors cursor-not-allowed">Terms of Service</span></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">Refund Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-not-allowed">Shipping Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FemmeFlow. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span>Instagram</span>
            <span>TikTok</span>
            <span>Pinterest</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
