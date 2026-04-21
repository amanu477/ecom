import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import { BackToTop } from "@/components/back-to-top";

import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Strategy from "@/pages/strategy";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#a3485d",
    colorForeground: "#2d2424",
    colorMutedForeground: "#8c7b7b",
    colorDanger: "#c0392b",
    colorBackground: "#faf8f5",
    colorInput: "#ede8e2",
    colorInputForeground: "#2d2424",
    colorNeutral: "#c8bfb8",
    colorModalBackdrop: "rgba(45,36,36,0.55)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-[#faf8f5] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-[#ede8e2]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#2d2424] font-serif",
    headerSubtitle: "text-[#8c7b7b]",
    socialButtonsBlockButtonText: "text-[#2d2424]",
    formFieldLabel: "text-[#2d2424]",
    footerActionLink: "text-[#a3485d] hover:text-[#7d3346]",
    footerActionText: "text-[#8c7b7b]",
    dividerText: "text-[#8c7b7b]",
    identityPreviewEditButton: "text-[#a3485d]",
    formFieldSuccessText: "text-[#2d7a45]",
    alertText: "text-[#2d2424]",
    logoBox: "mb-2",
    logoImage: "h-10",
    socialButtonsBlockButton: "border-[#c8bfb8] hover:border-[#a3485d] bg-white",
    formButtonPrimary: "bg-[#a3485d] hover:bg-[#7d3346] text-white",
    formFieldInput: "bg-[#ede8e2] border-[#c8bfb8] text-[#2d2424]",
    footerAction: "bg-[#f3ede7] border-t border-[#ede8e2]",
    dividerLine: "bg-[#c8bfb8]",
    alert: "bg-[#fdf0f0]",
    otpCodeFieldInput: "border-[#c8bfb8] bg-[#ede8e2] text-[#2d2424]",
    formFieldRow: "",
    main: "",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/strategy" component={Strategy} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={NotFound} />
      </Switch>
      <BackToTop />
    </Layout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your FemmeFlow account",
          },
        },
        signUp: {
          start: {
            title: "Join FemmeFlow",
            subtitle: "Discover trending fashion & beauty finds",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
