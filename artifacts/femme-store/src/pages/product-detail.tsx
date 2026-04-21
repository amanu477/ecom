import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { 
  useGetProduct, 
  useListReviews, 
  useAddToCart,
  useCreateReview
} from "@workspace/api-client-react";
import { useSessionId } from "@/hooks/use-session-id";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Star, TrendingUp, ShieldCheck, Truck, RotateCcw, 
  Minus, Plus, ShoppingBag, Eye, Heart, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = parseInt(id || "0", 10);
  const sessionId = useSessionId();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 15) + 12);
  const [countdown, setCountdown] = useState(3600 * 2 + Math.floor(Math.random() * 1800)); // ~2.5 hours
  
  const { data: product, isLoading: isProductLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: ["/api/products", productId] }
  });
  
  const { data: reviews, isLoading: isReviewsLoading } = useListReviews(
    { productId },
    { query: { enabled: !!productId, queryKey: ["/api/reviews", { productId }] } }
  );

  const addToCartMutation = useAddToCart();

  // Fake urgency timers
  useEffect(() => {
    const viewInterval = setInterval(() => {
      setViewers(prev => Math.max(8, prev + Math.floor(Math.random() * 5) - 2));
    }, 15000);
    
    const countInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => {
      clearInterval(viewInterval);
      clearInterval(countInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate(
      { data: { sessionId, productId, quantity } },
      {
        onSuccess: () => {
          toast({
            title: "Added to Cart",
            description: `${quantity}x ${product?.name} has been added to your bag.`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add item to cart. Please try again.",
          });
        }
      }
    );
  };

  if (isProductLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-24 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-muted aspect-[3/4] rounded-2xl w-full"></div>
          <div className="space-y-6 pt-8">
            <div className="h-6 w-32 bg-muted rounded"></div>
            <div className="h-12 w-3/4 bg-muted rounded"></div>
            <div className="h-8 w-1/4 bg-muted rounded"></div>
            <div className="h-px bg-muted w-full my-8"></div>
            <div className="h-32 w-full bg-muted rounded"></div>
            <div className="h-14 w-full bg-muted rounded-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  const stockPercentage = Math.min(100, Math.max(5, (product.stockCount / 50) * 100));

  return (
    <div className="bg-background min-h-screen">
      {/* Product Top Banner */}
      {product.isTrending && (
        <div className="bg-accent text-accent-foreground text-center py-2 px-4 text-sm font-semibold tracking-wider uppercase">
          🔥 High Demand: Over {product.reviewCount * 3} sold in the last 24 hours
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left: Images */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative rounded-2xl overflow-hidden bg-muted/20 border border-border"
            >
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-auto object-cover object-center aspect-[3/4]"
              />
              <button className="absolute top-4 right-4 p-3 bg-background/80 backdrop-blur rounded-full hover:text-primary hover:scale-110 transition-all shadow-sm">
                <Heart className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          {/* Right: Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs uppercase tracking-widest">{product.category}</Badge>
              {product.isTrending && (
                <Badge className="bg-primary hover:bg-primary text-xs uppercase tracking-widest border-none">
                  <TrendingUp className="w-3 h-3 mr-1" /> Trending
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight mb-4 text-foreground">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-muted text-muted'}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground underline decoration-muted-foreground/30 underline-offset-4 cursor-pointer">
                Read {product.reviewCount} Reviews
              </span>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-bold text-foreground">${product.sellingPrice.toFixed(2)}</span>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Urgency Drivers */}
            <div className="bg-muted/40 rounded-xl p-5 mb-8 border border-border/50">
              <div className="flex justify-between items-end mb-3 text-sm font-medium">
                <span className="text-destructive flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                  Hurry, only {product.stockCount} left in stock!
                </span>
                <span className="text-muted-foreground">Selling fast</span>
              </div>
              <Progress value={stockPercentage} className="h-2 mb-4 bg-muted" indicatorClassName="bg-destructive" />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background py-2 px-3 rounded-lg w-fit border border-border/50">
                <Eye className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{viewers}</span> people are looking at this right now
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center justify-between border border-border rounded-full p-1 h-14 w-full sm:w-1/3 bg-background">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button 
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 h-14 rounded-full text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {addToCartMutation.isPending ? "Adding..." : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart • ${(product.sellingPrice * quantity).toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/50 pt-8 mt-auto">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold">Premium Quality</span>
                <span className="text-xs text-muted-foreground">Tested and verified</span>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                <Truck className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold">Free Shipping</span>
                <span className="text-xs text-muted-foreground">On orders over $50</span>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                <RotateCcw className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold">Easy Returns</span>
                <span className="text-xs text-muted-foreground">30-day guarantee</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-border/50 bg-muted/20 pb-24">
        <div className="container mx-auto px-4 py-16">
          <Tabs defaultValue="details" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 mb-12 border-b border-border rounded-none">
              <TabsTrigger 
                value="details" 
                className="py-4 text-base font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                The Details
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="py-4 text-base font-medium rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2"
              >
                Reviews <Badge variant="secondary" className="ml-1 text-[10px] py-0">{product.reviewCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-serif font-medium text-foreground mb-4">Meticulously Crafted</h3>
              <p>
                {product.description} We spent months sourcing the highest quality materials to ensure this product not only meets but exceeds your expectations. Designed for the modern woman who refuses to compromise on quality or aesthetics.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 list-disc pl-5">
                <li>Premium grade materials</li>
                <li>Ergonomic, travel-friendly design</li>
                <li>Cruelty-free & ethically sourced</li>
                <li>Includes signature dust bag</li>
                <li>1-year manufacturer warranty</li>
              </ul>
            </TabsContent>
            
            
            <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                  <div className="text-6xl font-serif font-medium text-foreground">{product.rating.toFixed(1)}</div>
                  <div className="flex items-center text-accent mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-muted text-muted'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {product.reviewCount} reviews</p>
                  
                  <Button variant="outline" className="mt-6 w-full rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Write a Review
                  </Button>
                </div>
                
                <div className="w-full md:w-2/3 space-y-8">
                  {isReviewsLoading ? (
                    <div className="space-y-4">
                      <div className="h-24 bg-muted animate-pulse rounded-xl"></div>
                      <div className="h-24 bg-muted animate-pulse rounded-xl"></div>
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-border/50 pb-8 last:border-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={review.avatarUrl} alt={review.authorName} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {review.authorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm flex items-center gap-2">
                                {review.authorName}
                                <ShieldCheck className="w-3 h-3 text-accent" />
                                <span className="text-[10px] text-muted-foreground font-normal">Verified Buyer</span>
                              </div>
                              <div className="flex items-center text-accent mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'fill-muted text-muted'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
