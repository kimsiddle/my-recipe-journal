import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RecipeProvider } from "@/context/RecipeContext";
import { PlannerProvider } from "@/context/PlannerContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import RecipePage from "./pages/RecipePage";
import RecipeFormPage from "./pages/RecipeFormPage";
import PlannerPage from "./pages/Planner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RecipeProvider>
        <PlannerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/recipe/new" element={<RecipeFormPage />} />
                <Route path="/recipe/:id" element={<RecipePage />} />
                <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
                <Route path="/planner" element={<PlannerPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PlannerProvider>
      </RecipeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
