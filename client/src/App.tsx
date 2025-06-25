import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Features from "@/pages/features";

import Dashboard from "@/pages/dashboard";
import Lessons from "@/pages/lessons";
import Test from "@/pages/test";
import Projects from "@/pages/projects";
import Profile from "@/pages/profile";
import Curriculum from "@/pages/curriculum";
import Admin from "@/pages/admin";
import Gallery from "@/pages/gallery";
import Playground from "@/pages/playground";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if user has access via code gate
  const hasAccess = localStorage.getItem('investorDemoAccess') === 'true';
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 primary-gradient rounded-lg flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-white text-xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Investor Demo Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This section requires a 4-digit access code to view the platform demonstration. Please contact your representative for access.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Investor Demo Mode
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/features" component={Features} />
          <Route path="/gallery" component={Gallery} />
          
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/lessons">
            <ProtectedRoute>
              <Lessons />
            </ProtectedRoute>
          </Route>
          <Route path="/test">
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          </Route>
          <Route path="/projects">
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route path="/curriculum">
            <ProtectedRoute>
              <Curriculum />
            </ProtectedRoute>
          </Route>
          <Route path="/playground">
            <ProtectedRoute>
              <Playground />
            </ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
