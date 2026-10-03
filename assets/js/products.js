// Mishi's Artwork - Curated Art Catalog Data
const artCatalog = {
  originals: [
    {
      id: "orig-1",
      title: "Whispers of the Courtyard",
      category: "culture",
      categoryLabel: "Culture & Heritage",
      medium: "Oil & 24k Gold Leaf on Belgian Linen",
      size: "40 x 50 cm (16 x 20 in)",
      year: "2026",
      priceGBP: 420,
      status: "available", // available, sold, reserved
      featured: true,
      description: "An evocative study of historic archways bathed in afternoon sun. Layered with fine gold leaf to catch changing ambient light throughout the day. Hand-signed with Certificate of Authenticity.",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      roomPreviewImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      framingOptions: ["Unframed (Stretched Linen)", "Bespoke Natural Oak (+£65)", "Vintage Antique Gilt Wood (+£95)"],
      isOriginal: true
    },
    {
      id: "orig-2",
      title: "Silent Bloom in Solitude",
      category: "botanical",
      categoryLabel: "Botanical & Nature",
      medium: "Watercolor & Gouache on 640gsm Fabriano Cotton Paper",
      size: "30 x 42 cm (A3)",
      year: "2026",
      priceGBP: 280,
      status: "available",
      featured: true,
      description: "Delicate layered botanical study inspired by wild English hedgerows. Features soft deckled edges preserved for floating frame presentation.",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80",
      roomPreviewImage: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80",
      framingOptions: ["Deckled Edge Float Mount (+£55)", "Unframed in Glassine", "Smoked Ash Frame (+£75)"],
      isOriginal: true
    },
    {
      id: "orig-3",
      title: "Elysian Reverie (Self in Transit)",
      category: "emotional",
      categoryLabel: "Emotional Identity",
      medium: "Mixed Media, Raw Pigments & Oil on Heavy Canvas",
      size: "60 x 80 cm (24 x 31 in)",
      year: "2025",
      priceGBP: 680,
      status: "sold",
      featured: false,
      description: "An emotional exploration of diasporic longing, vulnerability, and belonging. Commissioned for private collection in Edinburgh.",
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80",
      roomPreviewImage: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80",
      framingOptions: ["Private Collection - Archival Prints Available"],
      isOriginal: true
    },
    {
      id: "orig-4",
      title: "Rose Tinted Nostalgia",
      category: "emotional",
      categoryLabel: "Emotional Identity",
      medium: "Oil & Cold Wax on Gallery Canvas",
      size: "50 x 50 cm (20 x 20 in)",
      year: "2026",
      priceGBP: 390,
      status: "available",
      featured: true,
      description: "Soft textural palette knife work in muted blush, dusty terracotta, and bone white. Captures the serenity of fleeting cherished memories.",
      image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1000&q=80",
      roomPreviewImage: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1000&q=80",
      framingOptions: ["Unframed Gallery Wrapped", "Raw Maple Wood Float Frame (+£70)"],
      isOriginal: true
    },
    {
      id: "orig-5",
      title: "Minarets at Dusk (Heritage Series)",
      category: "culture",
      categoryLabel: "Culture & Heritage",
      medium: "Watercolor, Ink & Metallic Copper on Heavy Cotton",
      size: "35 x 45 cm",
      year: "2026",
      priceGBP: 340,
      status: "available",
      featured: false,
      description: "Intricate architectural linework harmonized with ethereal watercolor washes of indigo and warm ochre.",
      image: "https://images.unsplash.com/photo-1576769267415-9642010aa962?auto=format&fit=crop&w=1000&q=80",
      roomPreviewImage: "https://images.unsplash.com/photo-1576769267415-9642010aa962?auto=format&fit=crop&w=1000&q=80",
      framingOptions: ["Unframed", "Matte White Archival Frame (+£50)"],
      isOriginal: true
    },
    {
      id: "orig-6",
      title: "Olive Branch & Wild Sage",
      category: "botanical",
      categoryLabel: "Botanical & Nature",
      medium: "Gouache & Pressed Pigment on Deckled Handmade Paper",
      size: "25 x 35 cm",
      year: "2026",
      priceGBP: 220,
      status: "reserved",
      featured: false,
      description: "Symbol of tranquility and peace. Painted with botanical earth pigments ground by hand in the studio.",
      image: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1000&q=80",
      roomPreviewImage: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1000&q=80",
      framingOptions: ["Float Glass Frame (+£45)"],
      isOriginal: true
    }
  ],

  prints: [
    {
      id: "print-1",
      title: "The Heritage Gateway (Archival Print)",
      category: "culture",
      categoryLabel: "Culture & Heritage",
      basePriceGBP: 28,
      sizes: {
        "A5 (15 x 21 cm)": 18,
        "A4 (21 x 30 cm)": 28,
        "A3 (30 x 42 cm)": 45,
        "A2 (42 x 60 cm)": 75
      },
      paper: "Hahnemühle German Etching 310gsm (100% Cotton)",
      finish: "Velvety Matte Fine Art Giclée",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
      bestseller: true,
      description: "Museum-quality Giclée reproduction of the original mixed media painting. Individually embossed with the studio seal and hand-signed by Mishi."
    },
    {
      id: "print-2",
      title: "Echoes of Ancestry",
      category: "culture",
      categoryLabel: "Culture & Heritage",
      basePriceGBP: 28,
      sizes: {
        "A5 (15 x 21 cm)": 18,
        "A4 (21 x 30 cm)": 28,
        "A3 (30 x 42 cm)": 45,
        "A2 (42 x 60 cm)": 75
      },
      paper: "Canson Rag Photographique 310gsm",
      finish: "Matte Smooth Archival",
      image: "https://images.unsplash.com/photo-1576769267415-9642010aa962?auto=format&fit=crop&w=1000&q=80",
      bestseller: false,
      description: "Intricate traditional patterns interwoven with modern negative space. A tribute to cultural continuity and heritage storytelling."
    },
    {
      id: "print-3",
      title: "Anatomy of Vulnerability",
      category: "emotional",
      categoryLabel: "Emotional Identity",
      basePriceGBP: 28,
      sizes: {
        "A5 (15 x 21 cm)": 18,
        "A4 (21 x 30 cm)": 28,
        "A3 (30 x 42 cm)": 45,
        "A2 (42 x 60 cm)": 75
      },
      paper: "Hahnemühle Photo Rag 308gsm",
      finish: "Textured Cotton Rag",
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80",
      bestseller: true,
      description: "A deeply introspective print portraying quiet inner resilience, vulnerability, and the expressive beauty of human emotion."
    },
    {
      id: "print-4",
      title: "Quiet Contemplation in Blush",
      category: "emotional",
      categoryLabel: "Emotional Identity",
      basePriceGBP: 28,
      sizes: {
        "A5 (15 x 21 cm)": 18,
        "A4 (21 x 30 cm)": 28,
        "A3 (30 x 42 cm)": 45,
        "A2 (42 x 60 cm)": 75
      },
      paper: "Somerset Velvet Fine Art 300gsm",
      finish: "Soft Texture Matte",
      image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1000&q=80",
      bestseller: false,
      description: "Warm blush tones and organic gestures that evoke a peaceful sanctuary within any room."
    },
    {
      id: "print-5",
      title: "Wild English Peonies",
      category: "botanical",
      categoryLabel: "Botanical & Floral",
      basePriceGBP: 25,
      sizes: {
        "A5 (15 x 21 cm)": 16,
        "A4 (21 x 30 cm)": 25,
        "A3 (30 x 42 cm)": 42,
        "A2 (42 x 60 cm)": 68
      },
      paper: "Hahnemühle German Etching 310gsm",
      finish: "Heavy Watercolor Texture",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=80",
      bestseller: true,
      description: "Botanical watercolor fine art print celebrating British countryside flora in spring bloom."
    },
    {
      id: "print-6",
      title: "Botanical Garden of the Mind",
      category: "botanical",
      categoryLabel: "Botanical & Floral",
      basePriceGBP: 25,
      sizes: {
        "A5 (15 x 21 cm)": 16,
        "A4 (21 x 30 cm)": 25,
        "A3 (30 x 42 cm)": 42,
        "A2 (42 x 60 cm)": 68
      },
      paper: "Hahnemühle Photo Rag 308gsm",
      finish: "Matte Fine Art",
      image: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1000&q=80",
      bestseller: false,
      description: "Graceful botanical illustration with delicate gold dust accents."
    }
  ],

  bookmarks: [
    {
      id: "bm-orig-1",
      title: "Hand-Painted Botanical Bookmark (1-of-1 Original)",
      type: "original",
      typeLabel: "Original Hand-Painted",
      priceGBP: 22,
      material: "300gsm Cold-Pressed 100% Cotton Rag with Hand-Torn Deckled Edges",
      details: "Genuine Raw Silk Tassel (Sage Green), Gold Leaf accents, Hand-Signed on reverse.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      badge: "One of a Kind",
      inStock: true
    },
    {
      id: "bm-orig-2",
      title: "Heritage Archway Miniature Bookmark (1-of-1 Original)",
      type: "original",
      typeLabel: "Original Hand-Painted",
      priceGBP: 24,
      material: "Heavy Fabriano Cotton Paper with Metallic Pigments",
      details: "Blush Pink Silk Ribbon, Deckled Edges, Sealed in Biodegradable Glassine Sleeve.",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
      badge: "One of a Kind",
      inStock: true
    },
    {
      id: "bm-print-1",
      title: "The Botanical Collection - Set of 3 Archival Print Bookmarks",
      type: "print",
      typeLabel: "Archival Print Set",
      priceGBP: 14,
      material: "350gsm Velvet Soft-Touch Matte Cardstock",
      details: "Includes 3 best-selling designs ('Wild Peony', 'Olive Branch', 'Courtyard'). Finished with satin eyelet ribbons.",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
      badge: "Best Value Set",
      inStock: true
    },
    {
      id: "bm-print-2",
      title: "Emotional Identity Trio - Luxury Print Bookmark Set",
      type: "print",
      typeLabel: "Archival Print Set",
      priceGBP: 14,
      material: "350gsm Heavy Art Board with Matte Protective Lamination",
      details: "Set of 3 poetic artwork bookmarks. Ideal gift for avid readers and art collectors alike.",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
      badge: "Collector Favorite",
      inStock: true
    }
  ],

  commissionTiers: [
    {
      id: "comm-1",
      title: "Miniature Keepsake",
      size: "A5 (15 x 21 cm / 6 x 8 in)",
      startingPriceGBP: 95,
      timeline: "1 - 2 Weeks",
      idealFor: "Botanical studies, single architectural landmarks, meaningful personal flora.",
      features: [
        "Watercolor & Gouache on 300gsm Cotton",
        "1 Concept Color Sketch Approval",
        "Hand-torn deckled edges",
        "Complimentary UK Tracked Delivery",
        "Certificate of Authenticity"
      ]
    },
    {
      id: "comm-2",
      title: "Bespoke Statement",
      size: "A4 (21 x 30 cm / 8 x 12 in)",
      startingPriceGBP: 185,
      popular: true,
      timeline: "2 - 3 Weeks",
      idealFor: "Family homes, historic UK architecture, expressive figurative portraits.",
      features: [
        "Mixed Media / Oil or Heavy Watercolor",
        "2 Iterative Color & Composition Studies",
        "24k Gold Leaf / Metallic Accents optional",
        "Framing consultation & Mount inclusion",
        "Progress photo/video updates via WhatsApp/Email"
      ]
    },
    {
      id: "comm-3",
      title: "Grand Canvas Centerpiece",
      size: "A3 to 50 x 70 cm (Up to 20 x 28 in)",
      startingPriceGBP: 340,
      timeline: "3 - 4 Weeks",
      idealFor: "Large living spaces, commemorative anniversary pieces, deep emotional narratives.",
      features: [
        "Oil & Cold Wax on Gallery Belgian Linen",
        "Full custom concept development",
        "Hand-made bespoke wooden floating frame option",
        "Priority VIP Studio Slot",
        "Insured White Glove Courier Delivery (UK & Worldwide)"
      ]
    }
  ],

  reviews: [
    {
      name: "Eleanor S.",
      location: "Kensington, London",
      rating: 5,
      text: "Receiving Mishi's original painting was such a special moment. The texture and delicate gold leaf catch the morning light so gracefully in our living room. Packaged with such exquisite care!",
      artwork: "Whispers of the Courtyard"
    },
    {
      name: "Dr. Hamza K.",
      location: "Edinburgh, UK",
      rating: 5,
      text: "The print quality on the Hahnemühle cotton paper is indistinguishable from an original watercolor. The cultural heritage themes resonate so deeply with our family.",
      artwork: "The Heritage Gateway Print"
    },
    {
      name: "Sophie & Liam M.",
      location: "Bath, UK",
      rating: 5,
      text: "Mishi painted a custom commission of our first home in the Cotswolds for our anniversary. The process was effortless, collaborative, and the final piece brought tears to our eyes.",
      artwork: "Bespoke Architectural Commission"
    },
    {
      name: "Amara P.",
      location: "Manchester, UK",
      rating: 5,
      text: "I bought the hand-painted deckled bookmark set as gifts for my book club. Every single one is a miniature masterpiece. I immediately came back to order an A3 print!",
      artwork: "Original Deckled Bookmarks"
    }
  ],

  instagramPosts: [
    {
      id: "ig-1",
      handle: "@mishisart.work",
      caption: "Layering raw earth pigments and genuine 24k gold leaf in the London studio today. ✨ #oilpainting #ukartist #fineart",
      likes: "1,248",
      comments: "64",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
      link: "https://www.instagram.com/mishisart.work"
    },
    {
      id: "ig-2",
      handle: "@mishisart.work",
      caption: "Packaging today's batch of hand-painted deckled bookmarks. Every piece is unique. 🌿📖 #artisan #botanicalart",
      likes: "954",
      comments: "42",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      link: "https://www.instagram.com/mishisart.work"
    },
    {
      id: "ig-3",
      handle: "@mishisart.work",
      caption: "Details from the 'Emotional Identity' series. Exploring quiet resilience through brushwork. 🕊️ #contemporaryart",
      likes: "1,890",
      comments: "112",
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=600&q=80",
      link: "https://www.instagram.com/mishisart.work"
    },
    {
      id: "ig-4",
      handle: "@mishisart.work",
      caption: "Fresh archival Giclée prints freshly inspected and stamped with the studio seal. Ready for UK dispatch! 📦",
      likes: "780",
      comments: "31",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80",
      link: "https://www.instagram.com/mishisart.work"
    }
  ]
};

// Currency conversion rates (relative to GBP)
const currencyRates = {
  GBP: { symbol: "£", rate: 1.0, code: "GBP", name: "Pound (£)" },
  USD: { symbol: "$", rate: 1.30, code: "USD", name: "Dollar ($)" },
  EUR: { symbol: "€", rate: 1.17, code: "EUR", name: "Euro (€)" },
  PKR: { symbol: "Rs", rate: 365.0, code: "PKR", name: "PKR (Rs)" }
};
