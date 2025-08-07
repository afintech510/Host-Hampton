import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Calendar, User, Filter } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  reviewText: string;
  eventType: string;
  createdAt: string;
  featured: boolean;
  location?: string;
  childAge?: number;
}

export default function Reviews() {
  const [filterRating, setFilterRating] = useState("all");
  const [filterEventType, setFilterEventType] = useState("all");

  // Fetch all reviews
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
    queryFn: async () => {
      const response = await fetch("/api/reviews?limit=50");
      const data = await response.json();
      return data.success ? data.reviews : [];
    }
  });

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating;
    const matchesEventType = filterEventType === "all" || review.eventType === filterEventType;
    return matchesRating && matchesEventType;
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'birthday-party': return '🎉';
      case 'trucker-hat': return '🧢';
      case 'studio-rental': return '🏢';
      case 'permanent-jewelry': return '💍';
      default: return '🎈';
    }
  };

  const getEventTypeName = (eventType: string) => {
    switch (eventType) {
      case 'birthday-party': return 'Birthday Party';
      case 'trucker-hat': return 'Trucker Hat Bar';
      case 'studio-rental': return 'Studio Rental';
      case 'permanent-jewelry': return 'Permanent Jewelry';
      default: return eventType;
    }
  };

  const eventTypes = [...new Set(reviews.map(r => r.eventType))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-ivory to-soft-blush-pink">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what families are saying about their Host Hampton party experiences.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-mauve-rose mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-mauve-rose mb-2">
                {reviews.length}
              </div>
              <p className="text-gray-600">Total Reviews</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-mauve-rose mb-2">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <p className="text-gray-600">4+ Star Reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Filter Reviews</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauve-rose"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Event Type</label>
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauve-rose"
                >
                  <option value="all">All Events</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {getEventTypeIcon(type)} {getEventTypeName(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mauve-rose mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reviews...</p>
              </CardContent>
            </Card>
          ) : filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className={`hover:shadow-md transition-shadow ${review.featured ? 'ring-2 ring-yellow-300' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-mauve-rose to-dusty-blue rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {review.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                      <Badge className="bg-mauve-rose/10 text-mauve-rose">
                        {getEventTypeIcon(review.eventType)} {getEventTypeName(review.eventType)}
                      </Badge>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 leading-relaxed mb-4">
                    <Quote className="h-4 w-4 text-gray-400 inline mr-2" />
                    {review.reviewText}
                  </blockquote>
                  
                  {(review.location || review.childAge) && (
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {review.location && (
                        <span>📍 {review.location}</span>
                      )}
                      {review.childAge && (
                        <span>🎂 Child age: {review.childAge}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-br from-mauve-rose/10 to-dusty-blue/10">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to create your own memorable experience?
            </h3>
            <p className="text-gray-600 mb-6">
              Join hundreds of happy families who've celebrated with Host Hampton.
            </p>
            <Button className="bg-mauve-rose hover:bg-mauve-rose/90">
              Get Your Quote Today
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}