import { useGetTrendingProducts, useListProducts, useGetCatalogSummary } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Clock, Star } from "lucide-react";

export default function Home() {
  const { data: trendingProducts, isLoading: isLoadingTrending } = useGetTrendingProducts();
  const { data: allProducts, isLoading: isLoadingProducts } = useListProducts({ limit: 4 });
  const { data: summary } = useGetCatalogSummary();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-secondary overflow-hidden pt-24 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a3485d\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur text-primary text-sm font-semibold uppercase tracking-wider mb-8 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Curated Viral Finds</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] mb-6 text-foreground"
            >
              Discover what's trending <span className="italic text-primary">before</span> it hits the mainstream.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Premium, problem-solving products selected by stylists. Elevated beauty, fashion, and wellness essentials that actually work.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/products">
                  Shop The Collection <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full bg-background/50 backdrop-blur hover:bg-background border-border/50">
                <Link href="/strategy">
                  View Dropshipping Playbook
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-foreground text-background py-6 border-t border-border/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center text-sm md:text-base font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-current" />
              <span>{summary?.avgRating != null ? summary.avgRating.toFixed(1) : "4.9"}/5 Average Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Now */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-primary font-semibold uppercase tracking-wider mb-4 text-sm">
                <TrendingUp className="w-5 h-5" />
                <h2>Going Viral</h2>
              </div>
              <h3 className="text-3xl md:text-5xl font-serif font-medium leading-tight">
                Selling out <span className="italic text-muted-foreground">fast</span>
              </h3>
            </div>
            <Button asChild variant="link" className="group p-0 h-auto text-foreground hover:text-primary justify-start md:justify-end text-base">
              <Link href="/products">
                View all trending <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {isLoadingTrending
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : trendingProducts?.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
          </div>
        </div>
      </section>

      {/* Categories / Banner */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-16 flex flex-col justify-center">
                <Badge className="w-fit mb-6 bg-secondary text-secondary-foreground hover:bg-secondary border-none uppercase tracking-widest px-3 py-1">
                  The Edit
                </Badge>
                <h2 className="text-3xl md:text-5xl font-serif font-medium mb-6 leading-tight">
                  Elevate your daily routine.
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-md">
                  From intelligent skincare to form-flattering wellness accessories, discover our meticulously curated selection.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['Beauty', 'Fashion', 'Accessories', 'Wellness'].map((cat) => (
                    <Link key={cat} href={`/products?category=${cat}`} className="group block">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background hover:border-primary/50 transition-colors">
                        <span className="font-medium text-sm tracking-wide">{cat}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="relative h-64 lg:h-auto bg-secondary">
                <img 
                  src="/images/led-mask.png" 
                  alt="Curated beauty products" 
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 divide-x divide-border/50"
          >
            <motion.div variants={itemVariants} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-serif font-medium text-primary mb-2">
                {summary?.totalProducts || "20"}+
              </div>
              <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Curated Pieces</div>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-serif font-medium text-primary mb-2">
                {summary?.trendingCount || "5"}
              </div>
              <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Viral Sensations</div>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-serif font-medium text-primary mb-2">
                {summary?.totalReviews || "1k"}+
              </div>
              <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Happy Customers</div>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-serif font-medium text-primary mb-2">
                4.9
              </div>
              <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Average Rating</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
