
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  reviewText: string;
  partyTheme?: string;
  reviewDate: string;
  platform: string;
  verified: boolean;
  featured: boolean;
}

interface ReviewsSectionProps {
  showFeatured?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function ReviewsSection({ 
  showFeatured = false, 
  limit = 3, 
  title = "Happy Parents, Magical Memories",
  subtitle = "Don't just take our word for it – see what Hampton families are saying"
}: ReviewsSectionProps) {
  const endpoint = showFeatured ? '/api/reviews/featured' : `/api/reviews?limit=${limit}`;
  
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', showFeatured ? 'featured' : 'all', limit],
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    }
  });

  const reviews = data?.reviews || [];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {title.includes("Magical") ? (
                <>
                  Happy Parents, <span className="text-orange-600">Magical Memories</span>
                </>
              ) : title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {title.includes("Magical") ? (
              <>
                Happy Parents, <span className="text-orange-600">Magical Memories</span>
              </>
            ) : title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.slice(0, limit).map((review) => (
            <Card key={review.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {renderStars(review.rating)}
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4 text-sm italic leading-relaxed">
                  "{review.reviewText}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {review.customerName}
                    </p>
                    {review.partyTheme && (
                      <p className="text-xs text-gray-500">{review.partyTheme}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(review.reviewDate)}</p>
                    <p className="text-xs text-gray-400">{review.platform}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}