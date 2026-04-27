
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { BlogAdmin } from "./pages/admin/BlogAdmin";
import { detectLanguage } from "@/utils/languageUtils";
import GAPageTracker from "@/components/GAPageTracker";

// Phase 1 placeholder for Builders page
import ComingSoon from "./pages/ComingSoon";
import AudioPage from "./pages/AudioPage";

const queryClient = new QueryClient();

/**
 * Redirects legacy /blog and /blog/:slug to the language-specific URL.
 * Language is detected from browser preferences since no prefix is in the URL.
 */
const BlogRedirect = () => {
  const { slug } = useParams<{ slug?: string }>();
  const lang = detectLanguage();
  const target = slug ? `/${lang}/blog/${slug}` : `/${lang}/blog`;
  return <Navigate to={target} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GAPageTracker />
          <Routes>
            {/* Afrinia public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/builders" element={<ComingSoon section="builders" />} />
            <Route path="/audio" element={<AudioPage />} />

            {/*
              Bilingual blog — EXPLICIT static routes only.
              /:lang/blog was avoided intentionally: React Router v6 scores
              dynamic+static (13pts) higher than /admin/* static+wildcard (8pts),
              which caused /admin/blog to be swallowed by the blog route.
            */}
            <Route path="/en/blog" element={<Blog />} />
            <Route path="/fr/blog" element={<Blog />} />
            <Route path="/en/blog/:slug" element={<BlogPost />} />
            <Route path="/fr/blog/:slug" element={<BlogPost />} />

            {/* Legacy /blog → redirect to browser-detected language */}
            <Route path="/blog" element={<BlogRedirect />} />
            <Route path="/blog/:slug" element={<BlogRedirect />} />

            {/* Legal */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Auth-protected */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin panel — unambiguous since /admin is a static prefix */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <BlogAdmin />
                </AdminRoute>
              }
            />

            {/* Legacy redirects — keeps old URLs from 404ing */}
            <Route path="/services" element={<Navigate to="/" replace />} />
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route path="/example-systems" element={<Navigate to="/" replace />} />
            <Route path="/built-by" element={<Navigate to="/" replace />} />
            <Route path="/solutions" element={<Navigate to="/" replace />} />
            <Route path="/industrial-analytics" element={<Navigate to="/" replace />} />
            <Route path="/outreachos" element={<Navigate to="/" replace />} />
            <Route path="/pricing" element={<Navigate to="/" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
