import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BookEvent from "@/pages/book-event";
import ThemedParties from "@/pages/themed-parties";  
import PartyDesigner from "@/pages/party-designer";
import AdminDashboard from "@/pages/admin-dashboard";
import Payment from "@/pages/payment";
import ShopEvents from "@/pages/shop-events";
import PartyRoomRental from "@/pages/party-room-rental";
import TruckHatBar from "@/pages/truck-hat-bar";
import PermanentJewelry from "@/pages/permanent-jewelry";
import MyEvents from "@/pages/my-events";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ThemedParties} />
      <Route path="/book-event" component={BookEvent} />
      <Route path="/themed-parties" component={ThemedParties} />
      <Route path="/party-designer" component={PartyDesigner} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/payment" component={Payment} />
      <Route path="/shop-events" component={ShopEvents} />
      <Route path="/party-room-rental" component={PartyRoomRental} />
      <Route path="/trucker-hat-bar" component={TruckHatBar} />
      <Route path="/permanent-jewelry" component={PermanentJewelry} />
      <Route path="/my-events" component={MyEvents} />
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
