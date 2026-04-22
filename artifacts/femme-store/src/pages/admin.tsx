import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard, Package, ShoppingBag, Sparkles, TrendingUp, DollarSign,
  Plus, CheckCircle, XCircle, RefreshCw, Pencil, Trash2, Eye, Bot, BarChart3,
  ArrowUpRight, Clock, AlertCircle, ChevronRight
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin123";

async function apiCall<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": ADMIN_PASSWORD,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? "";
const clerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

type DashboardData = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    pendingProductApprovals: number;
    estimatedProfit: number;
    profitMarginPercent: number;
  };
  recentOrders: Order[];
  topProducts: Product[];
  categoryBreakdown: { category: string; count: number }[];
  ordersByStatus: { status: string; count: number; revenue: number }[];
};

type Product = {
  id: number;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  category: string;
  imageUrl: string;
  stockCount: number;
  rating: number;
  reviewCount: number;
  isTrending: boolean;
  viralReason?: string;
  targetAudience?: string;
  supplierUrl?: string;
  tags?: string[];
};

type PendingProduct = {
  id: number;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  category: string;
  imageUrl: string;
  isTrending: boolean;
  viralReason?: string;
  targetAudience?: string;
  supplierUrl?: string;
  tags?: string[];
  source: string;
  status: string;
  trendScore: number;
  estimatedDemand?: string;
};

type Order = {
  id: number;
  sessionId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  total: number;
  items: unknown;
  createdAt: string;
};

const CATEGORIES = ["Beauty", "Skincare", "Hair Care", "Makeup", "Fashion", "Accessories", "Wellness", "Fitness", "Lifestyle"];
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function StatCard({ icon: Icon, title, value, sub, color }: { icon: React.ElementType; title: string; value: string; sub?: string; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{title}</span>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ProductForm({ initial, onSave, onClose }: { initial?: Partial<Product>; onSave: () => void; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    imageUrl: initial?.imageUrl ?? "",
    costPrice: initial?.costPrice?.toString() ?? "",
    marginPercent: "65",
    stockCount: initial?.stockCount?.toString() ?? "50",
    isTrending: initial?.isTrending ?? false,
    viralReason: initial?.viralReason ?? "",
    targetAudience: initial?.targetAudience ?? "",
    supplierUrl: initial?.supplierUrl ?? "",
    tags: initial?.tags?.join(", ") ?? "",
  });

  const [preview, setPreview] = useState<{ sellingPrice: number; profit: number; profitMargin: number } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cost = parseFloat(form.costPrice);
    const margin = parseFloat(form.marginPercent);
    if (!isNaN(cost) && cost > 0 && !isNaN(margin)) {
      const selling = parseFloat((cost / (1 - margin / 100)).toFixed(2));
      const profit = parseFloat((selling - cost).toFixed(2));
      const profitPct = parseFloat(((profit / selling) * 100).toFixed(1));
      setPreview({ sellingPrice: selling, profit, profitMargin: profitPct });
    } else {
      setPreview(null);
    }
  }, [form.costPrice, form.marginPercent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        category: form.category,
        imageUrl: form.imageUrl,
        costPrice: parseFloat(form.costPrice),
        marginPercent: parseFloat(form.marginPercent),
        stockCount: parseInt(form.stockCount),
        isTrending: form.isTrending,
        viralReason: form.viralReason || undefined,
        targetAudience: form.targetAudience || undefined,
        supplierUrl: form.supplierUrl || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      };
      if (initial?.id) {
        await apiCall(`/api/admin/products/${initial.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast({ title: "Product updated" });
      } else {
        await apiCall("/api/admin/products", { method: "POST", body: JSON.stringify(body) });
        toast({ title: "Product added" });
      }
      onSave();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Product Name *</Label>
          <Input value={form.name} onChange={set("name")} required placeholder="e.g. Gua Sha Facial Set" />
        </div>
        <div className="col-span-2">
          <Label>Description *</Label>
          <Textarea value={form.description} onChange={set("description")} required rows={3} />
        </div>
        <div>
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Stock Count</Label>
          <Input type="number" value={form.stockCount} onChange={set("stockCount")} min="0" />
        </div>
        <div>
          <Label>Cost Price ($) *</Label>
          <Input type="number" step="0.01" value={form.costPrice} onChange={set("costPrice")} required placeholder="0.00" />
        </div>
        <div>
          <Label>Profit Margin (%)</Label>
          <Input type="number" step="0.1" min="1" max="99" value={form.marginPercent} onChange={set("marginPercent")} />
        </div>
      </div>

      {preview && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="font-semibold text-green-800 mb-1">Calculated Pricing</p>
          <div className="grid grid-cols-3 gap-2 text-green-700">
            <div><span className="text-green-500">Selling Price</span><br /><strong>{fmt(preview.sellingPrice)}</strong></div>
            <div><span className="text-green-500">Profit per Unit</span><br /><strong>{fmt(preview.profit)}</strong></div>
            <div><span className="text-green-500">Margin</span><br /><strong>{preview.profitMargin}%</strong></div>
          </div>
        </div>
      )}

      <div>
        <Label>Image URL *</Label>
        <Input value={form.imageUrl} onChange={set("imageUrl")} required placeholder="https://..." />
      </div>
      <div>
        <Label>Supplier URL</Label>
        <Input value={form.supplierUrl} onChange={set("supplierUrl")} placeholder="https://aliexpress.com/..." />
      </div>
      <div>
        <Label>Viral Reason</Label>
        <Input value={form.viralReason} onChange={set("viralReason")} placeholder="Why this product is trending..." />
      </div>
      <div>
        <Label>Target Audience</Label>
        <Input value={form.targetAudience} onChange={set("targetAudience")} placeholder="e.g. Women 25-40 interested in skincare" />
      </div>
      <div>
        <Label>Tags (comma-separated)</Label>
        <Input value={form.tags} onChange={set("tags")} placeholder="skincare, beauty, trending" />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isTrending"
          checked={form.isTrending}
          onChange={(e) => setForm((f) => ({ ...f, isTrending: e.target.checked }))}
          className="h-4 w-4"
        />
        <Label htmlFor="isTrending">Mark as Trending</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-[#a3485d] hover:bg-[#7d3346] text-white">
          {saving ? "Saving..." : initial?.id ? "Update Product" : "Add Product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AdminContent({ isAdmin, isLoaded }: { isAdmin: boolean; isLoaded: boolean }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [automationRunning, setAutomationRunning] = useState(false);

  const setLoad = (k: string, v: boolean) => setLoading((l) => ({ ...l, [k]: v }));

  const loadDashboard = useCallback(async () => {
    setLoad("dashboard", true);
    try {
      const data = await apiCall<DashboardData>("/api/admin/dashboard");
      setDashboard(data);
    } catch (err: any) {
      toast({ title: "Failed to load dashboard", description: err.message, variant: "destructive" });
    } finally {
      setLoad("dashboard", false);
    }
  }, [toast]);

  const loadProducts = useCallback(async () => {
    setLoad("products", true);
    try {
      const data = await apiCall<Product[]>("/api/admin/products");
      setProducts(data);
    } catch (err: any) {
      toast({ title: "Failed to load products", description: err.message, variant: "destructive" });
    } finally {
      setLoad("products", false);
    }
  }, [toast]);

  const loadPending = useCallback(async () => {
    setLoad("pending", true);
    try {
      const data = await apiCall<PendingProduct[]>("/api/admin/pending-products");
      setPendingProducts(data);
    } catch (err: any) {
      toast({ title: "Failed to load pending products", description: err.message, variant: "destructive" });
    } finally {
      setLoad("pending", false);
    }
  }, [toast]);

  const loadOrders = useCallback(async () => {
    setLoad("orders", true);
    try {
      const data = await apiCall<Order[]>("/api/admin/orders");
      setOrders(data);
    } catch (err: any) {
      toast({ title: "Failed to load orders", description: err.message, variant: "destructive" });
    } finally {
      setLoad("orders", false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoaded || !isAdmin) return;
    loadDashboard();
  }, [isLoaded, isAdmin, loadDashboard]);

  useEffect(() => {
    if (!isLoaded || !isAdmin) return;
    if (activeTab === "products") loadProducts();
    if (activeTab === "pending") loadPending();
    if (activeTab === "orders") loadOrders();
  }, [activeTab, isLoaded, isAdmin, loadProducts, loadPending, loadOrders]);

  async function runAutomation() {
    setAutomationRunning(true);
    try {
      const result = await apiCall<{ added: number; skipped: number }>("/api/admin/automation/run", { method: "POST" });
      toast({ title: `Automation complete`, description: `${result.added} new trending products discovered.` });
      await loadPending();
      await loadDashboard();
    } catch (err: any) {
      toast({ title: "Automation failed", description: err.message, variant: "destructive" });
    } finally {
      setAutomationRunning(false);
    }
  }

  async function clearAllPending() {
    if (!window.confirm("Clear all pending products? This cannot be undone.")) return;
    try {
      await apiCall("/api/admin/pending-products", { method: "DELETE" });
      toast({ title: "Cleared", description: "All pending products removed." });
      await loadPending();
      await loadDashboard();
    } catch (err: any) {
      toast({ title: "Failed to clear", description: err.message, variant: "destructive" });
    }
  }

  async function approveProduct(id: number) {
    setLoad(`approve-${id}`, true);
    try {
      await apiCall(`/api/admin/pending-products/${id}/approve`, { method: "POST" });
      toast({ title: "Product approved and published!" });
      await loadPending();
      await loadDashboard();
    } catch (err: any) {
      toast({ title: "Failed to approve", description: err.message, variant: "destructive" });
    } finally {
      setLoad(`approve-${id}`, false);
    }
  }

  async function rejectProduct(id: number) {
    setLoad(`reject-${id}`, true);
    try {
      await apiCall(`/api/admin/pending-products/${id}`, { method: "DELETE" });
      toast({ title: "Product rejected" });
      await loadPending();
    } catch (err: any) {
      toast({ title: "Failed to reject", description: err.message, variant: "destructive" });
    } finally {
      setLoad(`reject-${id}`, false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product from the store?")) return;
    try {
      await apiCall(`/api/admin/products/${id}`, { method: "DELETE" });
      toast({ title: "Product deleted" });
      await loadProducts();
      await loadDashboard();
    } catch (err: any) {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    }
  }

  async function updateOrderStatus(id: number, status: string) {
    try {
      await apiCall(`/api/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast({ title: "Order status updated" });
      await loadOrders();
      await loadDashboard();
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#a3485d] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground max-w-sm">This page is only accessible to administrators. Please sign in with an admin account.</p>
        <Button onClick={() => setLocation("/")} variant="outline">Back to Store</Button>
      </div>
    );
  }

  const s = dashboard?.summary;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a3485d] rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground leading-none">FemmeFlow Admin</h1>
              <p className="text-xs text-muted-foreground">Store Management</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <Eye className="h-4 w-4 mr-1.5" /> View Store
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border border-border shadow-sm h-auto p-1">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-[#a3485d] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-[#a3485d] data-[state=active]:text-white">
              <Package className="h-4 w-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-[#a3485d] data-[state=active]:text-white relative">
              <Bot className="h-4 w-4" /> Automation
              {(s?.pendingProductApprovals ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {s?.pendingProductApprovals}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-[#a3485d] data-[state=active]:text-white">
              <ShoppingBag className="h-4 w-4" /> Orders
            </TabsTrigger>
          </TabsList>

          {/* ─── DASHBOARD TAB ─── */}
          <TabsContent value="dashboard">
            {loading.dashboard && !dashboard ? (
              <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-[#a3485d] border-t-transparent rounded-full" /></div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard icon={DollarSign} title="Total Revenue" value={fmt(s?.totalRevenue ?? 0)} color="bg-green-500" />
                  <StatCard icon={TrendingUp} title="Est. Profit" value={fmt(s?.estimatedProfit ?? 0)} sub={`${s?.profitMarginPercent ?? 0}% margin`} color="bg-[#a3485d]" />
                  <StatCard icon={ShoppingBag} title="Total Orders" value={String(s?.totalOrders ?? 0)} color="bg-blue-500" />
                  <StatCard icon={Package} title="Products" value={String(s?.totalProducts ?? 0)} color="bg-purple-500" />
                  <StatCard icon={Bot} title="Pending Approval" value={String(s?.pendingProductApprovals ?? 0)} color="bg-orange-500" />
                  <StatCard icon={Sparkles} title="Avg Margin" value={`${s?.profitMarginPercent ?? 0}%`} color="bg-teal-500" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-[#a3485d]" /> Recent Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {dashboard?.recentOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-6 py-4">No orders yet.</p>
                      ) : (
                        <div className="divide-y">
                          {dashboard?.recentOrders.slice(0, 6).map((o) => (
                            <div key={o.id} className="px-6 py-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{o.customerName}</p>
                                <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">{fmt(o.total)}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status] ?? ""}`}>{o.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#a3485d]" /> Top Rated Products
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {dashboard?.topProducts.map((p) => (
                          <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                            <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.category} · ⭐ {p.rating}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">{fmt(p.sellingPrice)}</p>
                              <p className="text-xs text-muted-foreground">{p.profitMargin.toFixed(0)}% margin</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Orders by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {dashboard?.ordersByStatus.map((s) => (
                        <div key={s.status} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] ?? "bg-gray-100 text-gray-700"}`}>{s.status}</span>
                            <span className="text-muted-foreground">{s.count} orders</span>
                          </div>
                          <span className="font-semibold">{fmt(s.revenue)}</span>
                        </div>
                      ))}
                      {(!dashboard?.ordersByStatus || dashboard.ordersByStatus.length === 0) && (
                        <p className="text-sm text-muted-foreground">No order data yet.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Products by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {dashboard?.categoryBreakdown.map((c) => (
                        <div key={c.category} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{c.category}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 rounded-full bg-[#a3485d]" style={{ width: `${Math.max(20, (c.count / (dashboard.summary.totalProducts || 1)) * 120)}px` }} />
                            <span className="font-semibold w-5 text-right">{c.count}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ─── PRODUCTS TAB ─── */}
          <TabsContent value="products">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Product Catalog</h2>
                  <p className="text-sm text-muted-foreground">{products.length} products in store</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadProducts} disabled={loading.products}>
                    <RefreshCw className={`h-4 w-4 mr-1.5 ${loading.products ? "animate-spin" : ""}`} /> Refresh
                  </Button>
                  <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-[#a3485d] hover:bg-[#7d3346] text-white">
                        <Plus className="h-4 w-4 mr-1.5" /> Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
                      <ProductForm onSave={loadProducts} onClose={() => setAddOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {loading.products && products.length === 0 ? (
                <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#a3485d] border-t-transparent rounded-full" /></div>
              ) : (
                <Card className="border-0 shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Selling</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img src={p.imageUrl} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
                              <span className="font-medium text-sm truncate max-w-[160px]">{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{p.category}</Badge></TableCell>
                          <TableCell className="text-sm">{fmt(p.costPrice)}</TableCell>
                          <TableCell className="text-sm font-semibold">{fmt(p.sellingPrice)}</TableCell>
                          <TableCell>
                            <span className="text-green-600 font-semibold text-sm">{p.profitMargin.toFixed(0)}%</span>
                          </TableCell>
                          <TableCell className="text-sm">{p.stockCount}</TableCell>
                          <TableCell className="text-sm">⭐ {p.rating}</TableCell>
                          <TableCell>
                            {p.isTrending ? (
                              <Badge className="bg-[#a3485d] text-white text-xs"><TrendingUp className="h-3 w-3 mr-1" />Trending</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Standard</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditProduct(p)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
                                  {editProduct?.id === p.id && (
                                    <ProductForm initial={editProduct} onSave={loadProducts} onClose={() => setEditProduct(null)} />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteProduct(p.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {products.length === 0 && (
                        <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No products found.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ─── AUTOMATION / PENDING TAB ─── */}
          <TabsContent value="pending">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-[#a3485d]" /> Trending Product Automation
                  </h2>
                  <p className="text-sm text-muted-foreground">AI-discovered products pending your approval before going live</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadPending} disabled={loading.pending}>
                    <RefreshCw className={`h-4 w-4 mr-1.5 ${loading.pending ? "animate-spin" : ""}`} /> Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={clearAllPending} disabled={pendingProducts.length === 0}>
                    <Trash2 className="h-4 w-4 mr-1.5" /> Clear All
                  </Button>
                  <Button size="sm" className="bg-[#a3485d] hover:bg-[#7d3346] text-white" onClick={runAutomation} disabled={automationRunning}>
                    <Sparkles className={`h-4 w-4 mr-1.5 ${automationRunning ? "animate-spin" : ""}`} />
                    {automationRunning ? "Scanning..." : "Run Discovery"}
                  </Button>
                </div>
              </div>

              <Card className="border border-amber-200 bg-amber-50 shadow-none">
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>How it works:</strong> Click "Run Discovery" to scan trending women's products based on viral potential, review scores, and demand signals. Review each suggestion and approve to publish to your store or reject to dismiss.
                  </p>
                </CardContent>
              </Card>

              {loading.pending && pendingProducts.length === 0 ? (
                <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#a3485d] border-t-transparent rounded-full" /></div>
              ) : pendingProducts.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-16 text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending products. Click "Run Discovery" to find trending products.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    pendingProducts.reduce<Record<string, Record<string, typeof pendingProducts>>>((acc, p) => {
                      const cat = p.category || "Uncategorized";
                      const src = p.source || "automation";
                      if (!acc[cat]) acc[cat] = {};
                      if (!acc[cat][src]) acc[cat][src] = [];
                      acc[cat][src].push(p);
                      return acc;
                    }, {})
                  ).map(([category, bySource]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#a3485d] mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" /> {category}
                      </h3>
                      {Object.entries(bySource).map(([source, products]) => (
                        <div key={source} className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                              Source: {source}
                            </span>
                            <span className="text-xs text-muted-foreground">{products.length} product{products.length !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            {products.map((p) => {
                              const isSupplierImg = (() => {
                                try {
                                  const h = new URL(p.imageUrl).hostname;
                                  return h.includes("aliexpress-media.com") || h.includes("alicdn.com") || h.includes("media-amazon.com") || h.includes("temu.com");
                                } catch { return false; }
                              })();
                              return (
                              <Card key={p.id} className={`border-0 shadow-sm overflow-hidden ${p.status !== "pending" ? "opacity-60" : ""}`}>
                                <div className="flex gap-4 p-4">
                                  <div className="relative shrink-0">
                                    <img src={p.imageUrl} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
                                    <span className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1 py-0.5 rounded-full ${isSupplierImg ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                                      {isSupplierImg ? "SUPPLIER" : "STOCK"}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[p.status] ?? "bg-gray-100 text-gray-700"}`}>{p.status}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                                    <div className="flex flex-wrap gap-2 text-xs mb-2">
                                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        {fmt(p.sellingPrice)} sell · {p.profitMargin.toFixed(0)}% margin
                                      </span>
                                      {p.trendScore > 0 && (
                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                          <TrendingUp className="h-3 w-3 inline mr-0.5" />Score {p.trendScore}
                                        </span>
                                      )}
                                    </div>
                                    {p.viralReason && (
                                      <p className="text-xs text-muted-foreground italic line-clamp-1">💡 {p.viralReason}</p>
                                    )}
                                    {p.targetAudience && (
                                      <p className="text-xs text-muted-foreground line-clamp-1">👥 {p.targetAudience}</p>
                                    )}
                                    {p.supplierUrl && (
                                      <a
                                        href={p.supplierUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                                      >
                                        <Eye className="h-3 w-3" /> View on {p.source || "Source"}
                                      </a>
                                    )}
                                  </div>
                                </div>
                                {p.status === "pending" && (
                                  <div className="border-t border-border px-4 py-3 flex gap-2 bg-muted/20">
                                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => approveProduct(p.id)} disabled={loading[`approve-${p.id}`]}>
                                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                      {loading[`approve-${p.id}`] ? "Approving..." : "Approve & Publish"}
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => rejectProduct(p.id)} disabled={loading[`reject-${p.id}`]}>
                                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                      {loading[`reject-${p.id}`] ? "Rejecting..." : "Reject"}
                                    </Button>
                                  </div>
                                )}
                              </Card>
                            );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── ORDERS TAB ─── */}
          <TabsContent value="orders">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Orders</h2>
                  <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading.orders}>
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${loading.orders ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>

              {loading.orders && orders.length === 0 ? (
                <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#a3485d] border-t-transparent rounded-full" /></div>
              ) : (
                <Card className="border-0 shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Update</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-sm">#{o.id}</TableCell>
                          <TableCell className="font-medium text-sm">{o.customerName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{o.customerEmail}</TableCell>
                          <TableCell className="font-semibold text-sm">{fmt(o.total)}</TableCell>
                          <TableCell className="text-sm capitalize">{o.paymentMethod}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status] ?? "bg-gray-100"}`}>{o.status}</span>
                          </TableCell>
                          <TableCell>
                            <Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v)}>
                              <SelectTrigger className="h-7 text-xs w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No orders yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ClerkAdminGuard() {
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata as any)?.role;
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const isAdmin = isLoaded && (role === "admin" || (ADMIN_EMAIL && email === ADMIN_EMAIL));
  return <AdminContent isAdmin={!!isAdmin} isLoaded={isLoaded} />;
}

function PasswordAdminGate() {
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_authed") === "1");
  const [error, setError] = useState(false);

  if (authed) return <AdminContent isAdmin={true} isLoaded={true} />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-1">Admin Login</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Enter your admin password to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-pass">Password</Label>
            <Input
              id="admin-pass"
              type="password"
              placeholder="Enter admin password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">Incorrect password. Try again.</p>}
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <PasswordAdminGate />;
}
