
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Globe, Shield, Star, Mountain } from 'lucide-react';

const teamMembers = [
  {
    name: 'Ankit Sharma',
    role: 'Founder & CEO',
    image: 'team-member-1',
    bio: 'An adventure enthusiast with a dream to share the magic of Uttarakhand with the world.',
  },
  {
    name: 'Priya Singh',
    role: 'Head of Operations',
    image: 'team-member-2',
    bio: 'Ensuring every trip is seamless, memorable, and exceeds expectations.',
  },
  {
    name: 'Rohan Gupta',
    role: 'Lead Travel Consultant',
    image: 'team-member-3',
    bio: 'A local expert who crafts personalized itineraries that unveil the hidden gems of the region.',
  },
];

const whyChooseUs = [
    {
        icon: Star,
        title: 'Curated Experiences',
        description: 'We don’t just offer stays; we offer handpicked experiences that connect you with the soul of Uttarakhand.'
    },
    {
        icon: Shield,
        title: 'Trusted & Secure',
        description: 'With a secure booking platform and 24/7 support, your peace of mind is our top priority.'
    },
    {
        icon: Globe,
        title: 'Local Expertise',
        description: 'Our team’s deep-rooted connection to the region ensures you get the most authentic and enriching journey.'
    },
     {
        icon: Heart,
        title: 'Passionate Service',
        description: 'We are a team of passionate travelers dedicated to making your vacation unforgettable.'
    },
]

export default function AboutPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'about-hero');

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[300px] w-full flex items-center justify-center text-center text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4">
          <h1 className="font-headline text-4xl font-bold md:text-6xl">About Uttarakhand Getaways</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl">
            Crafting Unforgettable Journeys in the Heart of the Himalayas.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
            <Mountain className="h-16 w-16 mx-auto text-primary mb-4" />
          <h2 className="font-headline text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            To be the most trusted and passionate gateway to the majestic beauty of Uttarakhand. We aim to connect travelers with the authentic culture, breathtaking landscapes, and warm hospitality of the Himalayas, creating memories that last a lifetime while promoting sustainable and responsible tourism.
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
       <section className="bg-muted/40 py-16 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold">Why Choose Us?</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">We are more than just a booking platform. We are your travel partners.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {whyChooseUs.map((item) => (
                        <div key={item.title} className="text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mx-auto mb-4">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
       </section>

      {/* Team Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold">Meet Our Core Team</h2>
            <p className="text-muted-foreground mt-2">The passionate individuals behind your perfect getaway.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => {
              const memberImage = PlaceHolderImages.find((img) => img.id === member.image);
              return (
                <Card key={member.name} className="text-center overflow-hidden border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-square">
                      {memberImage && (
                        <Image
                          src={memberImage.imageUrl}
                          alt={member.name}
                          data-ai-hint={memberImage.imageHint}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-primary font-medium">{member.role}</p>
                        <p className="text-muted-foreground mt-2 text-sm">{member.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
