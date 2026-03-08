import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { RecipeProvider } from "@/context/RecipeContext";
import { PlannerProvider } from "@/context/PlannerContext";
import { AuthGuard } from "@/components/AuthGuard";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import RecipePage from "./pages/RecipePage";
import RecipeFormPage from "./pages/RecipeFormPage";
import PlannerPage from "./pages/Planner";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RecipeProvider>
          <PlannerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/recipe/:id" element={<AppLayout />}>
                  <Route index element={<RecipePage />} />
                </Route>
                <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
                  <Route path="/" element={<Index />} />
                  <Route path="/recipe/new" element={<RecipeFormPage />} />
                  <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PlannerProvider>
        </RecipeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
