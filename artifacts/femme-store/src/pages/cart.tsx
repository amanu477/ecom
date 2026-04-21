import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useRemoveFromCart, useCreateOrder } from "@workspace/api-client-react";
import { useSessionId } from "@/hooks/use-session-id";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowRight, ShieldCheck, CreditCard, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  shippingAddress: z.string().min(10, "Full address is required"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

export default function Cart() {
  const sessionId = useSessionId();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: cart, isLoading } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: ["/api/cart", { sessionId }] } }
  );

  const removeFromCartMutation = useRemoveFromCart();
  const createOrderMutation = useCreateOrder();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      shippingAddress: "",
      paymentMethod: "",
    },
  });

  const handleRemoveItem = (itemId: number) => {
    removeFromCartMutation.mutate(
      { itemId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/cart", { sessionId }] });
          toast({
            title: "Item removed",
            description: "The item has been removed from your cart.",
          });
        }
      }
    );
  };

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    createOrderMutation.mutate(
      { 
        data: {
          sessionId,
          ...values
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/cart", { sessionId }] });
          toast({
            title: "Order Confirmed!",
            description: "Your order has been placed successfully. Check your email for details.",
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Checkout Failed",
            description: "There was an error processing your order. Please try again.",
          });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background pt-20 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="bg-background min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        
        <h1 className="text-3xl md:text-5xl font-serif font-medium mb-10 text-foreground">Your Bag</h1>

        {isEmpty ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border/50 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif mb-4">Your bag is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Looks like you haven't added anything to your bag yet. Discover our curated collection of viral essentials.</p>
            <Button asChild size="lg" className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/products">Shop The Collection</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Cart Items */}
            <div className="w-full lg:w-3/5">
              <div className="space-y-6">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-6 p-4 bg-card rounded-2xl border border-border/50"
                    >
                      <div className="w-24 h-32 md:w-32 md:h-40 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={item.productImage} 
                          alt={item.productName} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      
                      <div className="flex flex-col flex-1 py-1">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="font-serif text-lg font-medium hover:text-primary transition-colors line-clamp-2 pr-4">{item.productName}</h3>
                          </Link>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 -mr-2 -mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors flex-shrink-0"
                            disabled={removeFromCartMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-auto">
                          Qty: {item.quantity}
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                          <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                          <span className="text-sm font-medium text-muted-foreground">
                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Summary / Checkout */}
            <div className="w-full lg:w-2/5">
              <div className="bg-muted/30 p-6 md:p-8 rounded-3xl border border-border sticky top-28">
                
                {!isCheckingOut ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="font-serif text-2xl font-medium">Order Summary</h2>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                        <span className="font-medium">${cart.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium text-primary">Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes</span>
                        <span className="font-medium text-muted-foreground">Calculated at checkout</span>
                      </div>
                    </div>
                    
                    <Separator className="bg-border" />
                    
                    <div className="flex justify-between items-end">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-3xl">${cart.total.toFixed(2)}</span>
                    </div>
                    
                    <Button 
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full h-14 rounded-full text-base font-semibold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                      <Lock className="w-3 h-3" />
                      <span>Secure Checkout</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center mb-6">
                      <button 
                        onClick={() => setIsCheckingOut(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to bag
                      </button>
                    </div>
                    
                    <h2 className="font-serif text-2xl font-medium mb-6">Checkout Details</h2>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} className="bg-background border-border focus-visible:ring-primary" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jane@example.com" {...field} className="bg-background border-border focus-visible:ring-primary" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="shippingAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shipping Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St, Apt 4B, City, ZIP" {...field} className="bg-background border-border focus-visible:ring-primary" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-background border-border focus:ring-primary">
                                    <SelectValue placeholder="Select a payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="wise">Wise / Payoneer Transfer</SelectItem>
                                  <SelectItem value="crypto">Crypto (USDT / USDC)</SelectItem>
                                  <SelectItem value="bank">Direct Bank Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground mt-1">
                                Notice: We currently use manual payment processing for lower fees.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4 border-t border-border/50 mt-6">
                          <div className="flex justify-between items-end mb-6">
                            <span className="font-semibold">Total to Pay</span>
                            <span className="font-bold text-2xl">${cart.total.toFixed(2)}</span>
                          </div>
                          
                          <Button 
                            type="submit" 
                            disabled={createOrderMutation.isPending}
                            className="w-full h-14 rounded-full text-base font-semibold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
