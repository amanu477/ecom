import { Product } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.id}`} className="group block h-full">
        <Card className="h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 bg-card hover:shadow-xl hover:shadow-primary/5 rounded-xl">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="relative overflow-hidden bg-muted/30">
              <AspectRatio ratio={3 / 4}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </AspectRatio>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isTrending && (
                  <Badge variant="default" className="bg-primary/90 hover:bg-primary text-[10px] font-semibold uppercase tracking-wider border-none shadow-sm backdrop-blur-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {product.stockCount < 10 && (
                  <Badge variant="destructive" className="bg-destructive/90 hover:bg-destructive text-[10px] font-semibold uppercase tracking-wider border-none shadow-sm backdrop-blur-sm">
                    Only {product.stockCount} left
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                {product.category}
              </div>
              <h3 className="font-serif text-lg font-medium leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">
                    ${product.sellingPrice.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-accent">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden border-border/50 rounded-xl">
      <CardContent className="p-0 flex flex-col h-full">
        <AspectRatio ratio={3 / 4} className="bg-muted animate-pulse" />
        <div className="p-5 flex flex-col flex-1 space-y-3">
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          <div className="h-5 w-full bg-muted animate-pulse rounded" />
          <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
