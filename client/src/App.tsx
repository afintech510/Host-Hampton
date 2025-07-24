import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import PartyBooking from "@/pages/party-booking";
import BookEvent from "@/pages/book-event";
import ThemedParties from "@/pages/themed-parties";  
import PartyDesigner from "@/pages/party-designer";
import AdminDashboard from "@/pages/admin-dashboard";
import Payment from "@/pages/payment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ThemedParties} />
      <Route path="/party-booking" component={PartyBooking} />
      <Route path="/book-event" component={BookEvent} />
      <Route path="/themed-parties" component={ThemedParties} />
      <Route path="/party-designer" component={PartyDesigner} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/payment" component={Payment} />
      <Route component={NotFound} />
    </Switch>
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
