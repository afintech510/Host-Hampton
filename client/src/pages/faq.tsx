import { useState } from "react";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, HelpCircle } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: "booking",
      question: "How far in advance should I book my party?",
      answer: "We recommend booking at least 2-3 weeks in advance, especially for weekend dates. Popular party dates like holidays fill up quickly, so booking early ensures you get your preferred date and time."
    },
    {
      id: 2,
      category: "pricing",
      question: "What's included in the party packages?",
      answer: "All packages include decorations, themed activities, party host, setup and cleanup, and basic party supplies. You can add extras like face painting, magic shows, balloon animals, and professional photography."
    },
    {
      id: 3,
      category: "food",
      question: "Do you provide food and cake?",
      answer: "You're welcome to bring your own cake and food, or we can recommend local bakeries and catering options. We provide plates, cups, napkins, and utensils as part of our party packages."
    },
    {
      id: 4,
      category: "booking",
      question: "What ages do you cater to for birthday parties?",
      answer: "We specialize in parties for children ages 3-12, with themed activities and entertainment tailored to each age group. Our party packages can be customized for toddlers, preschoolers, and elementary school children."
    },
    {
      id: 5,
      category: "general",
      question: "How many children can attend?",
      answer: "Our standard packages accommodate 8-15 children. We can host larger parties with our premium packages that support up to 25 children. Additional staff and space are included for larger groups."
    },
    {
      id: 6,
      category: "policies",
      question: "What's your cancellation policy?",
      answer: "You can reschedule your party up to 7 days before the event at no cost. Cancellations made more than 14 days in advance receive a full refund minus a small processing fee. See our full cancellation policy for details."
    },
    {
      id: 7,
      category: "location",
      question: "Do you offer mobile party services?",
      answer: "Yes! We offer mobile services for certain party types. Studio rentals and permanent jewelry parties can be brought to your location for an additional travel fee. Contact us to discuss mobile options for your area."
    },
    {
      id: 8,
      category: "pricing",
      question: "How much does a typical party cost?",
      answer: "Party costs vary based on package selection, number of guests, and add-ons. Basic theme parties start around $300, while premium packages with multiple add-ons can range from $800-1200. Use our instant quote tool for accurate pricing."
    },
    {
      id: 9,
      category: "safety",
      question: "What safety measures do you have in place?",
      answer: "All staff are background checked and trained in child safety. Our party space is cleaned and sanitized between events. We maintain appropriate child-to-staff ratios and have first aid trained personnel on site."
    },
    {
      id: 10,
      category: "booking",
      question: "Can I make changes to my party after booking?",
      answer: "Yes, you can make changes up to 7 days before your party date. Changes to guest count, add-ons, or themes may affect pricing. Contact us as soon as possible to discuss modifications."
    },
    {
      id: 11,
      category: "trucker-hat",
      question: "What's included in the Trucker Hat Bar experience?",
      answer: "The Trucker Hat Bar includes personalized trucker hats for each guest, a variety of iron-on patches and designs, assistance from our design team, and a photo booth experience with instant text sharing capabilities."
    },
    {
      id: 12,
      category: "jewelry",
      question: "Is permanent jewelry really permanent?",
      answer: "Permanent jewelry is designed to be worn continuously, but it can be removed if needed using small scissors or wire cutters. The jewelry is welded closed without clasps for a seamless, comfortable fit."
    },
    {
      id: 13,
      category: "studio",
      question: "What can I use the studio rental for?",
      answer: "Our studio space is perfect for workshops, private classes, corporate events, photo shoots, and small gatherings. The space includes tables, chairs, basic lighting, and can accommodate up to 30 people."
    },
    {
      id: 14,
      category: "payment",
      question: "When do I need to pay for my party?",
      answer: "We require a 50% deposit to secure your booking, with the remaining balance due on the day of your party. We accept cash, credit cards, and digital payments. Payment plans are available for larger events."
    },
    {
      id: 15,
      category: "general",
      question: "Do you host adult parties?",
      answer: "Absolutely! While we specialize in children's parties, we also host adult birthday parties, corporate events, team building activities, and private workshops. Contact us to discuss adult-focused options."
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "booking", label: "Booking & Scheduling" },
    { value: "pricing", label: "Pricing & Packages" },
    { value: "food", label: "Food & Catering" },
    { value: "policies", label: "Policies" },
    { value: "location", label: "Location & Mobile" },
    { value: "safety", label: "Safety" },
    { value: "trucker-hat", label: "Trucker Hat Bar" },
    { value: "jewelry", label: "Permanent Jewelry" },
    { value: "studio", label: "Studio Rental" },
    { value: "payment", label: "Payment" },
    { value: "general", label: "General" }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-ivory to-soft-blush-pink">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our party services, booking process, and policies.
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauve-rose"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter</p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full p-6 text-left justify-between h-auto hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {faq.question}
                      </h3>
                      <span className="text-sm text-mauve-rose capitalize mt-1 block">
                        {categories.find(c => c.value === faq.category)?.label}
                      </span>
                    </div>
                    {expandedItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 ml-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 ml-4 flex-shrink-0" />
                    )}
                  </Button>
                  
                  {expandedItems.includes(faq.id) && (
                    <div className="px-6 pb-6">
                      <div className="border-t pt-4">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Still Have Questions */}
        <Card className="mt-12 bg-gradient-to-br from-mauve-rose/10 to-dusty-blue/10">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our friendly team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-mauve-rose hover:bg-mauve-rose/90">
                Call 631-998-9325
              </Button>
              <Button variant="outline" className="border-mauve-rose text-mauve-rose hover:bg-mauve-rose hover:text-white">
                Email Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}