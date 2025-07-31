import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BookEvent from "@/pages/book-event";
import GetQuote from "@/pages/get-quote";
import ThemedParties from "@/pages/themed-parties";  
import PartyDesigner from "@/pages/party-designer";
import AdminDashboard from "@/pages/admin-dashboard";
import Payment from "@/pages/payment";
import ShopEvents from "@/pages/shop-events";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import PartyRoomRental from "@/pages/party-room-rental";
import TruckHatBar from "@/pages/truck-hat-bar";
import PermanentJewelry from "@/pages/permanent-jewelry";
import MyEvents from "@/pages/my-events";
import Quote from "@/pages/quote-new";
import InvoiceCreate from "@/pages/admin/invoice-create";
import InvoiceView from "@/pages/invoice-view";
import InvoicePayment from "@/pages/invoice-payment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ThemedParties} />
      <Route path="/book-event" component={BookEvent} />
      <Route path="/get-quote" component={GetQuote} />
      <Route path="/quote" component={Quote} />
      <Route path="/themed-parties" component={ThemedParties} />
      <Route path="/party-designer" component={PartyDesigner} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin-dashboard/invoice/create" component={InvoiceCreate} />
      <Route path="/invoice/:invoiceId" component={InvoiceView} />
      <Route path="/invoice/:invoiceId/pay" component={InvoicePayment} />
      <Route path="/payment" component={Payment} />
      <Route path="/shop-events" component={ShopEvents} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
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
