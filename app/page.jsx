import HeroSection from "@/components/HeroSection";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, statsData } from "@/data/landing";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((statData, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {statData.value}
                </div>
                <div className="text-gray-600">{statData.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((featureData, index) => (
              <Card key={index} className="p-6">
                <CardContent>
                  {featureData.icon}
                  <h3 className="text-xl font-semibold">{featureData.title}</h3>
                  <p className="text-gray-600">{featureData.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
