import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ArchitectureProvider } from "./contexts/ArchitectureContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import VMDetail from "./pages/VMDetail";
import About from "./pages/About";
import Configuration from "./pages/Configuration";
import SystemConfig from "./pages/SystemConfig";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/vm/:id" component={VMDetail} />
      <Route path="/about" component={About} />
      <Route path="/configuration" component={Configuration} />
      <Route path="/system-config">
        {() => (
          <ProtectedRoute>
            <SystemConfig />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <ArchitectureProvider>
            <ThemeProvider
              defaultTheme="light"
              switchable
            >
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ThemeProvider>
          </ArchitectureProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
