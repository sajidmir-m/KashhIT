import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { NamespaceBoundary } from "@/lib/NamespaceBoundary";
import { ErrorBoundary } from "@/lib/ErrorBoundary";
import { analytics } from "@/lib/analytics";
import { useEffect } from "react";
import Home from "./pages/Home";
import Intro from "./pages/Intro";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/admin/Dashboard";
import VendorDashboard from "./pages/vendor/Dashboard";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import DeliveryRegister from "./pages/delivery/Register";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import SearchPage from "./pages/Search";
import ExploreProjects from "./pages/ExploreProjects";
import ProjectDetail from "./pages/ProjectDetail";
import Wishlist from "./pages/Wishlist";
import Internships from "./pages/Internships";
import InternshipDetail from "./pages/InternshipDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location.pathname]);

  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NamespaceBoundary />
            <PageViewTracker />
            <Routes>
              <Route path="/" element={<Intro />} />
              <Route path="/home" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/auth" element={<Auth />} />
              <Route path="/vendor/auth" element={<Auth />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/explore-projects" element={<ExploreProjects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/internships" element={<Internships />} />
              <Route path="/internships/:id" element={<InternshipDetail />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/vendor/*" element={<VendorDashboard />} />
              <Route path="/delivery/*" element={<DeliveryDashboard />} />
              <Route path="/delivery/register" element={<DeliveryRegister />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
