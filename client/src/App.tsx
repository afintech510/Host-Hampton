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
import UpcomingEvents from "@/pages/upcoming-events";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import PartyRoomRental from "@/pages/party-room-rental";
import TruckHatBar from "@/pages/truck-hat-bar";
import PermanentJewelry from "@/pages/permanent-jewelry";
import MyEvents from "@/pages/my-events";
import Quote from "@/pages/quote-new";
import PartyQuote from "@/pages/party-quote";
import InvoiceCreate from "@/pages/admin/invoice-create";
import InvoiceView from "@/pages/invoice-view";
import InvoicePayment from "@/pages/invoice-payment";
import CustomerInvoice from "./pages/customer-invoice";
import CustomerBooking from "./pages/customer-booking";
import TruckerHatReservation from "./pages/trucker-hat-reservation";
import MyThemeParty from "./pages/my-theme-party";
import MyTruckerHat from "./pages/my-trucker-hat";
import MyStudioRental from "./pages/my-studio-rental";
import MyPermanentJewelry from "./pages/my-permanent-jewelry";
import BookingConfirmation from "./pages/booking-confirmation";
import TermsAndConditions from "./pages/terms-and-conditions";
import CommunicationsAgreement from "./pages/communications-agreement";
import PrivacyPolicy from "./pages/privacy-policy";
import CancellationPolicy from "./pages/cancellation-policy";
import FAQ from "./pages/faq";
import Reviews from "./pages/reviews";
import Gallery from "./pages/gallery";
import GalleryManagement from "./pages/admin/gallery-management";
import About from "./pages/about";
import Contact from "./pages/contact";
import Pricing from "./pages/pricing";
import Footer from "@/components/footer";
import FloatingCheckoutButton from "@/components/floating-checkout-button";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Switch>
          <Route path="/" component={ThemedParties} />
          <Route path="/book-event" component={BookEvent} />
          <Route path="/get-quote" component={GetQuote} />
          <Route path="/quote" component={Quote} />
          <Route path="/party-quote" component={PartyQuote} />
          <Route path="/themed-parties" component={ThemedParties} />
          <Route path="/party-designer" component={PartyDesigner} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/admin-dashboard/invoice/create" component={InvoiceCreate} />
          <Route path="/invoice/:invoiceId" component={InvoiceView} />
          <Route path="/invoice/:invoiceId/pay" component={InvoicePayment} />
          <Route path="/docs/inv/:invoiceId" component={CustomerInvoice} />
          {/* Legacy routes - using wrapper for backward compatibility */}
          <Route path="/customer-booking/:leadId" component={() => <CustomerBooking />} />
          <Route path="/trucker-hat-reservation/:leadId" component={() => <TruckerHatReservation />} />
          {/* New secure booking routes */}
          <Route path="/my-theme-party/:id?" component={MyThemeParty} />
          <Route path="/my-trucker-hat/:id?" component={MyTruckerHat} />
          <Route path="/my-studio-rental/:id?" component={MyStudioRental} />
          <Route path="/my-permanent-jewelry/:id?" component={MyPermanentJewelry} />
          <Route path="/booking-confirmation" component={BookingConfirmation} />
          <Route path="/terms-and-conditions" component={TermsAndConditions} />
          <Route path="/communications-agreement" component={CommunicationsAgreement} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/cancellation-policy" component={CancellationPolicy} />
          <Route path="/faq" component={FAQ} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/admin/gallery" component={GalleryManagement} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/payment" component={Payment} />
          <Route path="/shop-events" component={ShopEvents} />
          <Route path="/upcoming-events" component={UpcomingEvents} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/checkout/success" component={CheckoutSuccess} />
          <Route path="/party-room-rental" component={PartyRoomRental} />
          <Route path="/trucker-hat-bar" component={TruckHatBar} />
          <Route path="/permanent-jewelry" component={PermanentJewelry} />
          <Route path="/my-events" component={MyEvents} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
      <FloatingCheckoutButton />
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
