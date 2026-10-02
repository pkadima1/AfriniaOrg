
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/auth/ProtectedRoute";
import Index from "./views/Index";
import About from "./views/About";
import Contact from "./views/Contact";
import Privacy from "./views/Privacy";
import Terms from "./views/Terms";
import Blog from "./views/Blog";
import BlogPost from "./views/BlogPost";
import NotFound from "./views/NotFound";
import Profile from "./views/Profile";
import Settings from "./views/Settings";
import { BlogAdmin } from "./views/admin/BlogAdmin";
import { detectLanguage } from "@/utils/languageUtils";
import GAPageTracker from "@/components/GAPageTracker";
import { routes } from "@/routing/routes";

import Builders from "./views/Builders";
import BuilderProfile from "./views/BuilderProfile";
import AudioPage from "./views/AudioPage";
import Unsubscribed from "./views/Unsubscribed";

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

/**
 * Sends mixed-case URLs (/About) to their lowercase form (/about).
 * WHY: Netlify matches public/_redirects case-sensitively, so /About answers
 * HTTP 404 to crawlers — correct, it is not a real URL — while React Router,
 * being case-insensitive, would still draw the About page there. Visitors are
 * moved to the real URL instead. Safe because every route and slug is
 * lowercase (the admin editor enforces it for slugs).
 */
const LowercasePathRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const lower = pathname.toLowerCase();
  return lower === pathname ? null : <Navigate to={`${lower}${search}${hash}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GAPageTracker />
          <LowercasePathRedirect />
          <Routes>
            {/* Afrinia public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Builders — language-prefixed like the blog (explicit static routes
                for the same router-scoring reason). /builders is 301'd to
                /fr/builders by Netlify; this Navigate covers in-app/dev visits. */}
            <Route path="/en/builders" element={<Builders />} />
            <Route path="/fr/builders" element={<Builders />} />
            <Route path="/en/builders/:slug" element={<BuilderProfile />} />
            <Route path="/fr/builders/:slug" element={<BuilderProfile />} />
            <Route path="/builders" element={<Navigate to="/fr/builders" replace />} />
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

            {/* Mailing — unsubscribe confirmation (reached via redirect from Netlify function) */}
            <Route path="/unsubscribed" element={<Unsubscribed />} />

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

            {/* Retired pages of the previous site. Netlify answers these with
                HTTP 404 for crawlers (public/_redirects); visitors who follow an
                old link are sent to the homepage instead of a dead end. */}
            <Route path="/services" element={<Navigate to={routes.home()} replace />} />
            <Route path="/products" element={<Navigate to={routes.home()} replace />} />
            <Route path="/example-systems" element={<Navigate to={routes.home()} replace />} />
            <Route path="/built-by" element={<Navigate to={routes.home()} replace />} />
            <Route path="/solutions" element={<Navigate to={routes.home()} replace />} />
            <Route path="/industrial-analytics" element={<Navigate to={routes.home()} replace />} />
            <Route path="/outreachos" element={<Navigate to={routes.home()} replace />} />
            <Route path="/pricing" element={<Navigate to={routes.home()} replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
