import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Download, 
  ExternalLink,
  Grid3X3,
  List,
  ImageIcon
} from "lucide-react";
import { format } from "date-fns";

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  eventType: string;
  featured: boolean;
  uploadedAt: string;
  tags: string[];
}

export default function Gallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Sample gallery data - in real app this would come from API
  const sampleImages: GalleryImage[] = [
    {
      id: 1,
      title: "Taylor Swift Themed Birthday Party",
      description: "A magical Taylor Swift birthday celebration with custom decorations, friendship bracelets, and sparkles galore!",
      imageUrl: "/api/placeholder/600/400",
      category: "birthday-parties",
      eventType: "theme-party",
      featured: true,
      uploadedAt: "2024-01-15T10:00:00Z",
      tags: ["taylor-swift", "birthday", "decorations", "kids"]
    },
    {
      id: 2,
      title: "Trucker Hat Bar Setup",
      description: "Custom trucker hat decorating station with patches, iron-ons, and creative design materials.",
      imageUrl: "/api/placeholder/600/400",
      category: "trucker-hat",
      eventType: "trucker-hat",
      featured: true,
      uploadedAt: "2024-01-20T14:30:00Z",
      tags: ["trucker-hat", "customization", "patches", "diy"]
    },
    {
      id: 3,
      title: "Permanent Jewelry Session",
      description: "Elegant permanent jewelry welding session with beautiful gold and silver chain options.",
      imageUrl: "/api/placeholder/600/400",
      category: "permanent-jewelry",
      eventType: "permanent-jewelry",
      featured: false,
      uploadedAt: "2024-01-25T16:00:00Z",
      tags: ["permanent-jewelry", "welding", "chains", "elegant"]
    },
    {
      id: 4,
      title: "Unicorn Birthday Magic",
      description: "Enchanting unicorn-themed party with pastel decorations, unicorn headbands, and magical activities.",
      imageUrl: "/api/placeholder/600/400",
      category: "birthday-parties",
      eventType: "theme-party",
      featured: true,
      uploadedAt: "2024-02-01T11:15:00Z",
      tags: ["unicorn", "magical", "pastel", "birthday"]
    },
    {
      id: 5,
      title: "Studio Space Setup",
      description: "Versatile studio space configured for workshops, private events, and creative activities.",
      imageUrl: "/api/placeholder/600/400",
      category: "studio-rental",
      eventType: "studio-rental",
      featured: false,
      uploadedAt: "2024-02-05T09:00:00Z",
      tags: ["studio", "workshop", "space", "versatile"]
    },
    {
      id: 6,
      title: "Spa Party Bliss",
      description: "Relaxing spa-themed birthday party with DIY face masks, nail art, and pamper stations.",
      imageUrl: "/api/placeholder/600/400",
      category: "birthday-parties",
      eventType: "theme-party",
      featured: false,
      uploadedAt: "2024-02-10T13:45:00Z",
      tags: ["spa", "relaxing", "nail-art", "pamper"]
    },
    {
      id: 7,
      title: "Sweets & Treats Wonderland",
      description: "Dessert-themed party with cupcake decorating, candy stations, and sweet treats galore!",
      imageUrl: "/api/placeholder/600/400",
      category: "birthday-parties",
      eventType: "theme-party",
      featured: true,
      uploadedAt: "2024-02-15T15:30:00Z",
      tags: ["sweets", "cupcakes", "candy", "desserts"]
    },
    {
      id: 8,
      title: "Slime Making Station",
      description: "Interactive slime-making party with colorful ingredients, glitter, and endless creative possibilities.",
      imageUrl: "/api/placeholder/600/400",
      category: "birthday-parties",
      eventType: "theme-party",
      featured: false,
      uploadedAt: "2024-02-20T12:00:00Z",
      tags: ["slime", "colorful", "interactive", "messy-fun"]
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "birthday-parties", label: "Birthday Parties" },
    { value: "trucker-hat", label: "Trucker Hat Bar" },
    { value: "permanent-jewelry", label: "Permanent Jewelry" },
    { value: "studio-rental", label: "Studio Rental" },
    { value: "workshops", label: "Workshops" },
    { value: "events", label: "Special Events" }
  ];

  const filteredImages = sampleImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || image.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredImages = filteredImages.filter(img => img.featured);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'birthday-parties': return '🎉';
      case 'trucker-hat': return '🧢';
      case 'permanent-jewelry': return '💍';
      case 'studio-rental': return '🏢';
      case 'workshops': return '🎨';
      default: return '📸';
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-ivory to-soft-blush-pink">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of memorable parties, events, and experiences we've created for families.
          </p>
        </div>

        {/* Featured Images */}
        {featuredImages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredImages.slice(0, 3).map((image) => (
                <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div onClick={() => handleImageClick(image)}>
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-mauve-rose/20 to-dusty-blue/20 flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(image.category)}</span>
                        <Badge className="bg-mauve-rose/10 text-mauve-rose text-xs">
                          {categories.find(c => c.value === image.category)?.label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{image.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search gallery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauve-rose"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauve-rose"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Gallery */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
        }>
          {filteredImages.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredImages.map((image) => (
              <Card key={image.id} className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
                viewMode === "list" ? "flex" : ""
              }`}>
                <div onClick={() => handleImageClick(image)} className={viewMode === "list" ? "flex w-full" : ""}>
                  <div className={`relative bg-gray-200 overflow-hidden ${
                    viewMode === "list" ? "w-48 h-32 flex-shrink-0" : "h-48"
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-mauve-rose/20 to-dusty-blue/20 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    {image.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{getCategoryIcon(image.category)}</span>
                      <Badge className="bg-mauve-rose/10 text-mauve-rose text-xs">
                        {categories.find(c => c.value === image.category)?.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{image.title}</h3>
                    <p className={`text-sm text-gray-600 ${viewMode === "grid" ? "line-clamp-2" : ""}`}>
                      {image.description}
                    </p>
                    {viewMode === "list" && (
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(image.uploadedAt), 'MMM d, yyyy')}
                        </span>
                        <div className="flex gap-1">
                          {image.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Image Detail Modal */}
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Gallery Image</DialogTitle>
            </DialogHeader>
            
            {selectedImage && (
              <div className="space-y-4">
                <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-mauve-rose/20 to-dusty-blue/20 flex items-center justify-center">
                    <ImageIcon className="h-24 w-24 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedImage.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedImage.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Category:</span>
                        <Badge className="bg-mauve-rose/10 text-mauve-rose">
                          {getCategoryIcon(selectedImage.category)} {categories.find(c => c.value === selectedImage.category)?.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Uploaded:</span>
                        <span className="text-sm text-gray-600">
                          {format(new Date(selectedImage.uploadedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedImage.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-br from-mauve-rose/10 to-dusty-blue/10">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want to see your event in our gallery?
            </h3>
            <p className="text-gray-600 mb-6">
              Book your memorable party experience with Host Hampton today!
            </p>
            <Button className="bg-mauve-rose hover:bg-mauve-rose/90">
              Plan Your Event
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}