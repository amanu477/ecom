import { useState } from "react";
import { useListProducts, useGetCatalogSummary } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

export default function Products() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Try to get category from URL if present
  const searchParams = new URLSearchParams(window.location.search);
  const urlCategory = searchParams.get("category");
  
  // Update initial state if URL has a category (only once)
  useState(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
    }
  });

  const { data: summary } = useGetCatalogSummary();
  const categories = ["All", "Beauty", "Fashion", "Wellness", "Accessories", "Lifestyle"];
  
  const { data: products, isLoading } = useListProducts(
    activeCategory !== "All" ? { category: activeCategory } : {}
  );

  return (
    <div className="bg-background min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-medium mb-6">The Collection</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Curated essentials for the modern lifestyle. Every piece selected for quality, aesthetic, and impact.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <Tabs 
            value={activeCategory} 
            onValueChange={(val) => {
              setActiveCategory(val);
              // Update URL without reload
              const url = new URL(window.location.href);
              if (val === "All") url.searchParams.delete("category");
              else url.searchParams.set("category", val);
              window.history.pushState({}, '', url.toString());
            }}
            className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0"
          >
            <TabsList className="h-12 bg-muted/50 p-1 w-max">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="px-6 rounded-full text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search collection..." 
              className="pl-10 h-12 bg-muted/30 border-border/50 focus-visible:ring-primary rounded-full"
            />
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeCategory !== "All" && (
          <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Showing results for:</span>
            <span className="font-semibold text-foreground px-3 py-1 bg-secondary rounded-full">
              {activeCategory}
            </span>
            <span className="ml-auto text-xs font-medium uppercase tracking-wider">
              {products?.length || 0} Products
            </span>
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-muted/30 rounded-3xl border border-border/50">
            <h3 className="text-2xl font-serif mb-2">No products found</h3>
            <p className="text-muted-foreground">Try selecting a different category or clearing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
