import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-ivory to-soft-blush-pink">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Host Hampton
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Creating magical party experiences for children and memorable moments for families since 2020.
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Host Hampton was born from a simple belief: every child deserves to feel special on their birthday. 
                Founded by parents who understand the stress of party planning, we created a space where imagination 
                comes to life and memories are made to last a lifetime.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To provide stress-free, magical party experiences that celebrate childhood wonder while giving 
                parents the gift of time to simply enjoy their child's special day.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Makes Us Special</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li>• Fully themed party experiences tailored to your child's interests</li>
                <li>• Professional party hosts who bring energy and excitement</li>
                <li>• Complete setup and cleanup - you just show up and celebrate</li>
                <li>• Flexible party packages for all budgets and group sizes</li>
                <li>• Safe, clean, and COVID-conscious environment</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}