import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  StarOff,
  Plus,
  ImageIcon,
  Search,
  Filter
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

export default function GalleryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "birthday-parties",
    tags: "",
    featured: false
  });
  const { toast } = useToast();

  // Sample data - in real app this would come from API
  const sampleImages: GalleryImage[] = [
    {
      id: 1,
      title: "Taylor Swift Themed Birthday Party",
      description: "A magical Taylor Swift birthday celebration with custom decorations, friendship bracelets, and sparkles galore!",
      imageUrl: "/api/placeholder/400/300",
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
      imageUrl: "/api/placeholder/400/300",
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
      imageUrl: "/api/placeholder/400/300",
      category: "permanent-jewelry",
      eventType: "permanent-jewelry",
      featured: false,
      uploadedAt: "2024-01-25T16:00:00Z",
      tags: ["permanent-jewelry", "welding", "chains", "elegant"]
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
                         image.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || image.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = () => {
    // In real app, this would upload to server
    toast({
      title: "Image Uploaded",
      description: "Gallery image has been uploaded successfully.",
    });
    setUploadDialogOpen(false);
    resetForm();
  };

  const handleEdit = (image: GalleryImage) => {
    setSelectedImage(image);
    setFormData({
      title: image.title,
      description: image.description,
      category: image.category,
      tags: image.tags.join(", "),
      featured: image.featured
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    // In real app, this would update on server
    toast({
      title: "Image Updated",
      description: "Gallery image has been updated successfully.",
    });
    setEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = (image: GalleryImage) => {
    if (confirm(`Are you sure you want to delete "${image.title}"?`)) {
      // In real app, this would delete on server
      toast({
        title: "Image Deleted",
        description: "Gallery image has been deleted successfully.",
      });
    }
  };

  const toggleFeatured = (image: GalleryImage) => {
    // In real app, this would update on server
    toast({
      title: image.featured ? "Removed from Featured" : "Added to Featured",
      description: `"${image.title}" ${image.featured ? "removed from" : "added to"} featured images.`,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "birthday-parties",
      tags: "",
      featured: false
    });
    setSelectedImage(null);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
          <p className="text-gray-600">Manage gallery images and showcase your events</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-mauve-rose hover:bg-mauve-rose/90">
              <Plus className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Image</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Image File</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-mauve-rose transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your image here, or click to browse</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
                  <Button variant="outline" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter image title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter image description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauve-rose"
                  >
                    {categories.filter(c => c.value !== "all").map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="rounded border-gray-300 text-mauve-rose focus:ring-mauve-rose"
                />
                <Label htmlFor="featured">Mark as featured</Label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} className="bg-mauve-rose hover:bg-mauve-rose/90">
                  Upload Image
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-mauve-rose">{sampleImages.length}</div>
            <p className="text-sm text-gray-600">Total Images</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-mauve-rose">{sampleImages.filter(img => img.featured).length}</div>
            <p className="text-sm text-gray-600">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-mauve-rose">{sampleImages.filter(img => img.category === 'birthday-parties').length}</div>
            <p className="text-sm text-gray-600">Birthday Parties</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-mauve-rose">
              {new Set(sampleImages.flatMap(img => img.tags)).size}
            </div>
            <p className="text-sm text-gray-600">Unique Tags</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Card key={image.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-br from-mauve-rose/20 to-dusty-blue/20 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
                {image.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-mauve-rose/10 text-mauve-rose">
                    {getCategoryIcon(image.category)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{image.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {image.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {image.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{image.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  {format(new Date(image.uploadedAt), 'MMM d, yyyy')}
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFeatured(image)}
                    className={image.featured ? "text-yellow-600" : ""}
                  >
                    {image.featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                  </Button>
                  
                  <Button size="sm" variant="outline" onClick={() => handleEdit(image)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(image)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauve-rose"
                >
                  {categories.filter(c => c.value !== "all").map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-featured"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="rounded border-gray-300 text-mauve-rose focus:ring-mauve-rose"
              />
              <Label htmlFor="edit-featured">Mark as featured</Label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="bg-mauve-rose hover:bg-mauve-rose/90">
                Update Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}