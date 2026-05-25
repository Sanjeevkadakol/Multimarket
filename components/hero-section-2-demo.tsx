import React from 'react';
import { HeroSection } from '@/components/ui/hero-section-2';

export default function HeroSectionDemo() {
  return (
    <div className="w-full">
      <HeroSection
        logo={{
            url: "https://images.unsplash.com/photo-1557821552-17105176677c?w=100&fit=crop&q=80",
            alt: "Multimarket Logo",
            text: "Multimarket"
        }}
        slogan="SMART COMPARATIVE AGGREGATOR"
        title={
          <>
            Compare Deals. <br />
            <span className="text-primary">Shop Smarter.</span>
          </>
        }
        subtitle="Search and compare prices, detailed specifications, and verified customer reviews across Amazon, Walmart, and Flipkart in real-time. Find the absolute best deals instantly."
        callToAction={{
          text: "START COMPARING DEALS",
          href: "#search-input",
        }}
        backgroundImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
        contactInfo={{
            website: "multimarket.com",
            phone: "1-800-555-MKT",
            address: "Silicon Valley, CA",
        }}
      />
    </div>
  );
}

