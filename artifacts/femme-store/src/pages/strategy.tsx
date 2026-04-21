import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Target, Zap, MousePointerClick, RefreshCw, BarChart } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Strategy() {
  const { data: products } = useListProducts();

  return (
    <div className="bg-background min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center">
          <Badge className="mb-6 bg-accent text-accent-foreground hover:bg-accent border-none uppercase tracking-widest px-4 py-1.5">
            Internal Document
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-medium mb-6 text-foreground leading-tight">
            The Dropshipping Playbook
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A transparent look at the strategy, economics, and automation behind the FemmeFlow brand.
          </p>
        </div>

        {/* Section 1: Product Strategy */}
        <section className="mb-20 md:mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-serif font-medium">1. Product Strategy</h2>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-10 text-muted-foreground">
            <p>
              We don't sell general items. We sell <strong>viral problem-solvers</strong>. Our criteria for product selection:
              High perceived value, visually demonstratable on TikTok, high profit margin (min 60%), and addresses a specific insecurity or desire.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">Cost</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">Retail</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">Margin</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground">Viral Angle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products?.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate max-w-[150px] md:max-w-[250px]">{p.name}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">${p.costPrice.toFixed(2)}</td>
                      <td className="p-4 font-medium">${p.sellingPrice.toFixed(2)}</td>
                      <td className="p-4 text-emerald-600 font-semibold">{p.profitMargin}%</td>
                      <td className="p-4 text-sm text-muted-foreground italic truncate max-w-[200px]">{p.viralReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 2: Payment Flow Workaround */}
        <section className="mb-20 md:mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
              <DollarSign className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-serif font-medium">2. Alternative Payment Flow</h2>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-10 text-muted-foreground">
            <p>
              When traditional payment gateways (Stripe/PayPal) are unavailable in a region, we use an asynchronous checkout flow. 
              The customer checks out with 0 friction, and we handle the payment collection via email automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0"></div>
            
            <Card className="relative z-10 border-border bg-card shadow-lg">
              <CardHeader className="pb-2">
                <Badge className="w-fit mb-2">Step 1</Badge>
                <CardTitle className="text-lg font-serif">Checkout</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Customer places order selecting "Wise/Crypto/Bank" as payment method. Zero friction.
              </CardContent>
            </Card>

            <Card className="relative z-10 border-primary bg-primary/5 shadow-lg">
              <CardHeader className="pb-2">
                <Badge className="w-fit mb-2 bg-primary text-primary-foreground">Step 2</Badge>
                <CardTitle className="text-lg font-serif text-primary">Invoice Gen</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                System automatically generates a custom payment link/invoice based on their selection.
              </CardContent>
            </Card>

            <Card className="relative z-10 border-border bg-card shadow-lg">
              <CardHeader className="pb-2">
                <Badge className="w-fit mb-2">Step 3</Badge>
                <CardTitle className="text-lg font-serif">Email Flow</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Customer receives professional invoice email. Reminder sequence starts if unpaid.
              </CardContent>
            </Card>

            <Card className="relative z-10 border-border bg-card shadow-lg">
              <CardHeader className="pb-2">
                <Badge className="w-fit mb-2 bg-accent text-accent-foreground hover:bg-accent">Step 4</Badge>
                <CardTitle className="text-lg font-serif">Fulfillment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upon manual payment verification, order status changes to "Paid" and is sent to supplier.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Traffic Engine */}
        <section className="mb-20 md:mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-serif font-medium">3. The Organic Traffic Engine</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted/30 rounded-3xl p-8 border border-border">
              <h3 className="text-xl font-serif font-medium mb-4 flex items-center gap-2">
                <MousePointerClick className="w-5 h-5 text-primary" />
                TikTok Theme Pages
              </h3>
              <p className="text-muted-foreground mb-6">
                We run 5 faceless TikTok accounts per product. We repurpose viral videos from Douyin/Xiaohongshu, 
                add trending audio, and post 3x daily per account.
              </p>
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-accent mt-0.5" />
                  <span>Cost: $0 (Just time/CapCut)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-accent mt-0.5" />
                  <span>Goal: 1 viral video (1M+ views) per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-accent mt-0.5" />
                  <span>Conversion: Link in bio + strong CTA</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 rounded-3xl p-8 border border-border">
              <h3 className="text-xl font-serif font-medium mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                UGC Micro-Influencers
              </h3>
              <p className="text-muted-foreground mb-6">
                We don't pay for posts. We send free product to creators with 10k-50k followers in exchange for 2 raw UGC videos.
              </p>
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-accent mt-0.5" />
                  <span>Cost: Product cost + shipping ($15 avg)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-accent mt-0.5" />
                  <span>Usage: Run these as Spark Ads on TikTok</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-accent mt-0.5" />
                  <span>ROI: Highly authentic, builds trust instantly</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
