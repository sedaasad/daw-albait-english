import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth, RequireAdmin, RedirectIfAuthed } from "@/components/RouteGuards";

import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import PendingApproval from "./pages/PendingApproval.tsx";
import Home from "./pages/Home.tsx";
import Lessons from "./pages/Lessons.tsx";
import ModuleDetail from "./pages/ModuleDetail.tsx";
import LessonDetail from "./pages/LessonDetail.tsx";
import Practice from "./pages/Practice.tsx";
import Profile from "./pages/Profile.tsx";
import AdminHome from "./pages/admin/AdminHome.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminLessons from "./pages/admin/AdminLessons.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" dir="rtl" />
      <BrowserRouter>
        <AuthProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<RedirectIfAuthed><Auth /></RedirectIfAuthed>} />
              <Route
                path="/pending-approval"
                element={
                  <RequireAuth>
                    <PendingApproval />
                  </RequireAuth>
                }
              />
              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/lessons" element={<RequireAuth><Lessons /></RequireAuth>} />
              <Route path="/modules/:moduleId" element={<RequireAuth><ModuleDetail /></RequireAuth>} />
              <Route path="/modules/:moduleId/:lessonId" element={<RequireAuth><LessonDetail /></RequireAuth>} />
              <Route path="/practice" element={<RequireAuth><Practice /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/admin" element={<RequireAdmin><AdminHome /></RequireAdmin>} />
              <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
              <Route path="/admin/lessons" element={<RequireAdmin><AdminLessons /></RequireAdmin>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
