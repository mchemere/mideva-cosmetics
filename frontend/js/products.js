/**
 * Mideva Cosmetics - Product Catalog & Store Data
 * Comprehensive catalog covering Skincare, Makeup, Body Care, Hair Care, Fragrances & Accessories.
 */

const MIDEVA_PRODUCTS = [
  {
    id: "luminous-vitamin-c-serum",
    name: "Luminous Glow Vitamin C Serum",
    category: "skincare",
    categoryName: "Skincare",
    price: 3200,
    originalPrice: 3800,
    rating: 4.9,
    reviewCount: 148,
    badge: "Best Seller",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/serum-vit-c.jpg",
    shortDesc: "Potent 15% Vitamin C, Hyaluronic Acid, and African Baobab extract to brighten, firm, and illuminate dull skin.",
    description: "Our signature brightening elixir is formulated with cold-stabilized 15% Ethyl Ascorbic Acid, high-molecular Hyaluronic Acid, and antioxidant-rich wild-harvested Kenyan Baobab seed extract. Designed to actively fade hyperpigmentation, smooth uneven texture, and protect against environmental pollution while imparting an ethereal, glass-skin glow.",
    keyBenefits: [
      "Visibly reduces dark spots and hyperpigmentation in 21 days",
      "Stimulates natural collagen synthesis for firmer, bouncier skin",
      "Delivers intense multi-depth hydration without greasy residue",
      "Neutralizes free radicals caused by sunlight and blue light"
    ],
    ingredients: "Aqua (Deionized Water), 3-O-Ethyl Ascorbic Acid (Vitamin C 15%), Sodium Hyaluronate, Niacinamide (Vitamin B3), Adansonia Digitata (Baobab) Seed Oil, Camellia Sinensis (Green Tea) Leaf Extract, Ferulic Acid, Vegetable Glycerin, Tocopherol (Vitamin E), Phenoxyethanol, Ethylhexylglycerin.",
    howToUse: "Dispense 3 to 4 drops onto cleansed, slightly damp face and neck every morning. Gently press into skin using upward motions. Follow with Hydra-Plump Moisturizer and daily broad-spectrum SPF."
  },
  {
    id: "hydra-plump-moisturizer",
    name: "Hydra-Plump Hyaluronic Acid Moisturizer",
    category: "skincare",
    categoryName: "Skincare",
    price: 2850,
    originalPrice: 3400,
    rating: 4.8,
    reviewCount: 96,
    badge: "Hydrating",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/cream-hydra.jpg",
    shortDesc: "Weightless 72-hour moisture surge with triple-molecular hyaluronic acid and soothing African chamomile.",
    description: "A velvety, cloud-like cream-gel that floods parched skin with continuous hydration for up to 72 hours. Powered by three molecular weights of hyaluronic acid that penetrate from the skin barrier deep into dermis layers, reinforced with ceramides and calming African blue chamomile.",
    keyBenefits: [
      "Deeply restores moisture barrier without clogging pores",
      "Instantly cushions fine dehydration lines",
      "Soothes redness, flakiness, and irritation",
      "Leaves skin silky smooth, primed for makeup application"
    ],
    ingredients: "Aqua, Caprylic/Capric Triglyceride, Sodium Hyaluronate Crosspolymer, Ceramide NP, Squalane (Olive derived), Chamomilla Recutita Extract, Aloe Barbadensis Leaf Juice, Butyrospermum Parkii (Shea) Butter, Allantoin, Carbomer, Sodium Hydroxide.",
    howToUse: "Smooth a nickel-sized amount over face, neck, and décolletage morning and evening after applying your serum. Can also be used as a 10-minute flash moisture sleep mask."
  },
  {
    id: "rose-petal-facial-mist",
    name: "Rose Petal Hydrating Mist & Toner",
    category: "skincare",
    categoryName: "Skincare",
    price: 1950,
    originalPrice: 2400,
    rating: 4.7,
    reviewCount: 78,
    badge: "Organic",
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    image: "assets/images/mist-rose.jpg",
    shortDesc: "Pure steam-distilled Damask rose water, niacinamide, and witch hazel to balance pH and awaken tired skin.",
    description: "Handcrafted from steam-distilled Bulgarian Damask rose petals, this multi-functional toner balances skin pH, refines pore appearance, and provides an instant midday hydration boost. Calming rose aromas soothe both the skin and senses.",
    keyBenefits: [
      "Balances natural skin micro-biome and regulates excess oil",
      "Instantly refreshes and hydrates tired, air-conditioned skin",
      "Sets makeup with a dewy, non-powdery finish",
      "Alcohol-free formula gentle enough for the most sensitive complexions"
    ],
    ingredients: "Rosa Damascena (Rose) Flower Distillate, Hamamelis Virginiana (Witch Hazel) Water, Niacinamide, Glycerin, Panthenol (Pro-Vitamin B5), Hibiscus Sabdariffa Flower Extract, Rosa Canina (Rosehip) Fruit Extract, Potassium Sorbate.",
    howToUse: "Hold bottle 8-10 inches away and mist generously over face after cleansing or throughout the day whenever skin needs a refreshing drink of hydration."
  },
  {
    id: "gentle-radiance-gel-cleanser",
    name: "Gentle Radiance Clarifying Gel Cleanser",
    category: "skincare",
    categoryName: "Skincare",
    price: 2200,
    originalPrice: 2600,
    rating: 4.9,
    reviewCount: 114,
    badge: "Clean Beauty",
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    image: "assets/images/cleanser-gel.jpg",
    shortDesc: "Sulfate-free foaming cleanser with green tea and gentle papaya enzymes that purifies without drying.",
    description: "A gentle yet remarkably thorough daily cleanser that dissolves waterproof makeup, sunscreen, and daily pollutants while safeguarding the skin's vital acid mantle. Enhanced with tropical papaya enzymes and calming antioxidant green tea.",
    keyBenefits: [
      "Effortlessly removes makeup, SPF, and impurities in one step",
      "Non-stripping formulation preserves essential lipids",
      "Mild fruit enzymes gently decongest pores",
      "Leaves skin feeling remarkably soft, balanced, and invigorated"
    ],
    ingredients: "Aqua, Coco-Glucoside, Glycerin, Disodium Cocoyl Glutamate, Carica Papaya Fruit Extract, Camellia Sinensis (Green Tea) Leaf Extract, Salix Alba (Willow Bark) Extract, Citric Acid, Xanthan Gum, Pelargonium Graveolens (Geranium) Oil.",
    howToUse: "Pump 1-2 doses onto wet palms. Work into a silky foam and massage across face in circular motions for 60 seconds. Rinse thoroughly with lukewarm water."
  },
  {
    id: "velvet-satin-matte-lipstick",
    name: "Velvet Satin Matte Lipstick – Kenya Sunset",
    category: "makeup",
    categoryName: "Makeup",
    price: 1800,
    originalPrice: 2200,
    rating: 4.9,
    reviewCount: 215,
    badge: "Trending",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/lipstick-matte.jpg",
    shortDesc: "Ultra-pigmented, transfer-resistant warm terracotta nude enriched with organic shea butter and Vitamin E.",
    description: "Inspired by the breathtaking golden hour hues over Nairobi, Kenya Sunset is the ultimate universal warm terracotta shade. Featuring high-impact pigments suspended in a conditioning base of East African shea butter and Vitamin E that won't crack, feather, or dry lips.",
    keyBenefits: [
      "12-hour comfortable wear with zero flaking",
      "Universal shade calibrated specifically for warm and rich undertones",
      "Intensely pigmented single-swipe color payoff",
      "Infused with shea butter to nourish and cushion lips all day"
    ],
    ingredients: "Dimethicone, Polyglyceryl-2 Triisostearate, Butyrospermum Parkii (Shea) Butter, Ricinus Communis Seed Oil, Candelilla Wax, Carnauba Wax, Tocopheryl Acetate, CI 77491, CI 77492, CI 77891, CI 15850.",
    howToUse: "Glide directly onto lips starting from the cupid's bow outwards. For razor-sharp definition, outline lips first with our Velvet Precision Lip Liner."
  },
  {
    id: "high-shine-lip-nectar",
    name: "High-Shine Glossy Lip Nectar – Golden Honey",
    category: "makeup",
    categoryName: "Makeup",
    price: 1500,
    originalPrice: 1850,
    rating: 4.8,
    reviewCount: 142,
    badge: "New",
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    image: "assets/images/lipgloss-honey.jpg",
    shortDesc: "Non-sticky, mirror-glass reflective shine infused with jojoba oil and plumping peptides in luscious honey shimmer.",
    description: "A cushiony, non-tacky lip oil-gloss hybrid that drenches lips in high-gloss shine and juicy moisture. Enriched with cold-pressed jojoba oil and Maxi-Lip peptides that boost natural lip volume and smooth texture over time.",
    keyBenefits: [
      "Ultra-reflective glass shine without any stickiness",
      "Visibly plumps and softens lip lines",
      "Subtle golden shimmer creates 3D dimensional fullness",
      "Delicious natural vanilla honey scent"
    ],
    ingredients: "Polybutene, Simmondsia Chinensis (Jojoba) Seed Oil, Diisostearyl Malate, Palmitoyl Tripeptide-1, Ethylhexyl Palmitate, Mica, Silica Dimethyl Silylate, Vanilla Planifolia Fruit Extract.",
    howToUse: "Apply generously across bare lips for an effortless glassy pout, or layer on top of Velvet Satin Lipstick to elevate your evening glam."
  },
  {
    id: "flawless-radiance-foundation",
    name: "Flawless Radiance Weightless Foundation",
    category: "makeup",
    categoryName: "Makeup",
    price: 3600,
    originalPrice: 4200,
    rating: 4.9,
    reviewCount: 184,
    badge: "Award Winner",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/foundation-glow.jpg",
    shortDesc: "Breathable, medium-to-full buildable coverage with SPF 25. Calibrated for 24 diverse undertone shades.",
    description: "A breathable, second-skin foundation that blurs imperfections, evens tone, and imparts a natural soft-satin radiance. Formulated specifically to honor diverse melanin-rich complexions with zero ashy flashback under flash photography.",
    keyBenefits: [
      "Transfer-proof 16-hour wear that resists tropical humidity",
      "SPF 25 mineral protection against daily UV rays",
      "Enriched with Niacinamide to improve bare skin over time",
      "Seamless blendability with beauty sponge or foundation brush"
    ],
    ingredients: "Water, Cyclopentasiloxane, Titanium Dioxide, Niacinamide, Isododecane, Dimethicone Crosspolymer, Glycerin, PEG-10 Dimethicone, Iron Oxides (CI 77491, CI 77492, CI 77499), Sodium Chloride.",
    howToUse: "Shake bottle well. Dispense 1 to 2 pumps onto the back of your hand. Dot onto forehead, cheeks, and chin, then blend outward with a damp sponge or dense foundation brush."
  },
  {
    id: "golden-hour-highlighter",
    name: "Golden Hour Champagne Highlighter",
    category: "makeup",
    categoryName: "Makeup",
    price: 2400,
    originalPrice: 2900,
    rating: 4.8,
    reviewCount: 89,
    badge: "Glow",
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    image: "assets/images/highlighter-gold.jpg",
    shortDesc: "Ultra-fine milled illuminating powder that melts into skin for a sun-kissed, candlelit champagne sheen.",
    description: "Capture the magic of an equatorial golden sunset. This finely baked illuminating powder features zero chunky glitter, delivering instead a silky, lit-from-within glow that blends seamlessly into the cheekbones, brow bone, and collarbones.",
    keyBenefits: [
      "Silk-touch micro-pearls that never emphasize skin texture",
      "Warm champagne gold hue flattering on all complexions",
      "Long-wearing formulation with zero fallout",
      "Packaged in a luxurious rose-gold magnetic compact with mirror"
    ],
    ingredients: "Mica, Talc, Squalane, Synthetic Fluorphlogopite, Dimethicone, Zinc Stearate, Caprylyl Glycol, Ethylhexylglycerin, Tin Oxide, CI 77891, CI 77491.",
    howToUse: "Sweep with a fan brush onto the tops of cheekbones, tip of the nose, cupid’s bow, and collarbones for an instant ethereal gleam."
  },
  {
    id: "golden-radiance-body-elixir",
    name: "Golden Radiance Shimmering Body Elixir",
    category: "bodycare",
    categoryName: "Body Care",
    price: 2900,
    originalPrice: 3500,
    rating: 4.9,
    reviewCount: 167,
    badge: "Best Seller",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/body-oil.jpg",
    shortDesc: "Luxurious dry body oil with Marula, Argan oil, and champagne micro-pearls for head-to-toe golden radiance.",
    description: "An intoxicating dry-touch body nectar infused with cold-pressed African Marula oil, organic Moroccan Argan oil, and light-catching champagne shimmer. Absorbs instantly without greasiness, leaving skin cashmere-soft and delicately perfumed with Madagascar vanilla and white blossoms.",
    keyBenefits: [
      "Leaves skin luminous, glistening, and sun-kissed",
      "Locks in hydration and helps diminish the appearance of stretch marks",
      "Dry-finish formula does not transfer onto clothes",
      "Multi-purpose: apply on arms, legs, décolletage, or dry hair ends"
    ],
    ingredients: "Sclerocarya Birrea (Marula) Seed Oil, Argania Spinosa Kernel Oil, Coco-Caprylate/Caprate, Helianthus Annuus Seed Oil, Calcium Sodium Borosilicate, Silica, Fragrance (Parfum), Tocopherol.",
    howToUse: "Shake well before use to disperse the luminous pearls. Massage over arms, legs, and collarbones after showering for an opulent all-over glow."
  },
  {
    id: "whipped-shea-body-butter",
    name: "Whipped Shea & Cocoa Deep Nourishing Body Butter",
    category: "bodycare",
    categoryName: "Body Care",
    price: 2100,
    originalPrice: 2500,
    rating: 4.8,
    reviewCount: 130,
    badge: "Nourish",
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    image: "assets/images/body-butter.jpg",
    shortDesc: "Rich, decadent butter that melts instantly to soothe dry skin and lock in moisture for 48 hours.",
    description: "Air-whipped to decadent perfection, this luscious cream brings together wild-harvested Nilotica Shea Butter, unrefined Cocoa Butter, and sweet Almond Oil. Melts at body temperature to cocoon severely dry, ash-prone skin in lasting softness.",
    keyBenefits: [
      "48-hour continuous barrier replenishment",
      "Helps fade dry patches, scars, and stretch marks",
      "Rich in natural essential fatty acids and Vitamin A & E",
      "Delicate natural cocoa and warm caramel aroma"
    ],
    ingredients: "Butyrospermum Parkii (Shea Butter), Theobroma Cacao (Cocoa) Seed Butter, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Mangifera Indica (Mango) Seed Butter, Maranta Arundinacea (Arrowroot) Powder, Tocopherol.",
    howToUse: "Scoop a generous dollop and warm between palms. Massage into clean, damp skin following your bath or shower, focusing on elbows, knees, and heels."
  },
  {
    id: "exfoliating-coffee-body-polish",
    name: "Exfoliating Brown Sugar & Coffee Body Polish",
    category: "bodycare",
    categoryName: "Body Care",
    price: 1950,
    originalPrice: 2300,
    rating: 4.7,
    reviewCount: 95,
    badge: "Exfoliate",
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    image: "assets/images/body-scrub.jpg",
    shortDesc: "Raw organic Kenyan Highland coffee, dark brown cane sugar, and sweet almond oil to polish away dull skin.",
    description: "Handmade with freshly roasted Kenyan Arabica coffee grounds and raw dark cane sugar crystals. Buffs away dry surface flakes, stimulates circulation, and targets the appearance of cellulite while enriching skin with natural caffeine and emollients.",
    keyBenefits: [
      "Natural caffeine invigorates and visibly tightens skin",
      "Polishes rough skin to revealing baby-soft smoothness",
      "Essential oils leave skin deeply moisturized even before lotion",
      "Aromatic awakening morning ritual"
    ],
    ingredients: "Coffea Arabica (Kenyan Coffee) Seed Powder, Sucrose (Brown Sugar), Prunus Amygdalus Dulcis (Sweet Almond) Oil, Cocos Nucifera (Coconut) Oil, Cinnamomum Zeylanicum Bark Oil, Tocopherol.",
    howToUse: "In the shower, apply a handful to damp skin. Massage in firm circular motions targeting thighs, arms, and back. Rinse thoroughly with warm water."
  },
  {
    id: "botanical-crown-hair-elixir",
    name: "Botanical Crown Scalp & Hair Growth Elixir",
    category: "haircare",
    categoryName: "Hair Care",
    price: 2650,
    originalPrice: 3100,
    rating: 4.9,
    reviewCount: 192,
    badge: "Best Seller",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/hair-oil.jpg",
    shortDesc: "Rosemary, Biotin, Black Castor Oil, and Peppermint to invigorate follicles, strengthen edges, and thicken strands.",
    description: "A nutrient-dense botanical treatment developed for natural coils, curls, protective styles, and relaxed hair. Formulated with authentic Jamaican Black Castor Oil, cold-extracted Rosemary essential oil, and Biotin to awaken dormant follicles, rescue thinning edges, and banish dry itchy scalp.",
    keyBenefits: [
      "Proven scalp stimulation encourages stronger, thicker growth",
      "Restores thinning edges and calms post-braiding scalp tension",
      "Seals moisture into split ends to prevent breakage",
      "Free of mineral oil, silicones, and parabens"
    ],
    ingredients: "Ricinus Communis (Black Castor) Seed Oil, Rosmarinus Officinalis (Rosemary) Leaf Oil, Mentha Piperita (Peppermint) Oil, Biotin, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Simmondsia Chinensis Seed Oil, Moringa Oleifera Seed Oil.",
    howToUse: "Section hair and apply 3-5 drops directly onto scalp. Massage thoroughly with fingertips for 3 minutes. For daily edge care, apply a single drop and smooth with a soft bristle brush."
  },
  {
    id: "deep-moisture-hair-repair-mask",
    name: "Deep Moisture Silk Amino Acid Repair Mask",
    category: "haircare",
    categoryName: "Hair Care",
    price: 2500,
    originalPrice: 2950,
    rating: 4.8,
    reviewCount: 83,
    badge: "Repair",
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    image: "assets/images/hair-mask.jpg",
    shortDesc: "Intensive salon-grade hair masque that repairs heat and chemical damage, restoring elasticity and shine.",
    description: "An ultra-hydrating salon restorative treatment packed with pure Silk Amino Acids, hydrolyzed Baobab protein, and organic avocado butter. Penetrates the hair cortex to rebuild fractured keratin bonds and lock in elasticity.",
    keyBenefits: [
      "Reduces hair breakage by up to 88% after first treatment",
      "Transforms dry, brittle strands into silky, flowing tresses",
      "Provides supreme detangling slip for wash days",
      "Protects against thermal heat styling up to 230°C"
    ],
    ingredients: "Aqua, Cetearyl Alcohol, Persea Gratissima (Avocado) Butter, Behentrimonium Methosulfate, Hydrolyzed Silk, Hydrolyzed Adansonia Digitata (Baobab) Seed Protein, Panthenol, Cetrimonium Chloride, Parfum.",
    howToUse: "After shampooing, distribute generously from roots to ends. Detangle with a wide-tooth comb. Cover with a shower cap for 15-20 minutes (or sit under a hooded dryer for deep penetration). Rinse clean."
  },
  {
    id: "eclat-de-rose-perfume",
    name: "Mideva Éclat de Rose Eau de Parfum (50ml)",
    category: "fragrances",
    categoryName: "Fragrances",
    price: 6500,
    originalPrice: 7500,
    rating: 4.9,
    reviewCount: 156,
    badge: "Signature",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/perfume-rose.jpg",
    shortDesc: "Bulgarian rose, warm Madagascar vanilla, bergamot, and rich amber woods. Sophisticated, long-lasting luxury.",
    description: "The crown jewel of our fragrance atelier. Mideva Éclat de Rose opens with a sparkling burst of Italian Bergamot and pink pepper, blossoming into a lavish heart of centifolia rose and Moroccan jasmine, resting on a sultry foundation of bourbon vanilla, golden amber, and cedarwood.",
    keyBenefits: [
      "High concentration Eau de Parfum lasting 14+ hours on skin",
      "Complex, multi-layered notes that evolve gracefully throughout the day",
      "Elegantly crafted crystal flacon with magnetic gold cap",
      "The quintessential signature scent for unforgettable evenings"
    ],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Alpha-Isomethyl Ionone, Benzyl Salicylate, Citronellol, Coumarin, Geraniol, Limonene, Linalool.",
    howToUse: "Mist onto pulse points where body heat is concentrated: inner wrists, base of the throat, behind earlobes, and inside the elbows. Avoid rubbing wrists together."
  },
  {
    id: "amber-santal-body-mist",
    name: "Amber Santal & White Jasmine Body Mist (150ml)",
    category: "fragrances",
    categoryName: "Fragrances",
    price: 2400,
    originalPrice: 2800,
    rating: 4.7,
    reviewCount: 68,
    badge: "Fresh",
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    image: "assets/images/fragrance-mist.jpg",
    shortDesc: "Airy, all-over fine fragrance mist infused with creamy sandalwood, night-blooming jasmine, and golden peach.",
    description: "An effortless, everyday fragrance veil that envelops you in warm sandalwood and fresh night-blooming jasmine. Formulated with hydrating aloe vera so it refreshes your skin with every spritz.",
    keyBenefits: [
      "Light, breezy, non-overpowering day wear fragrance",
      "Infused with organic aloe vera for subtle skin conditioning",
      "Perfect travel-friendly companion for purse or gym bag",
      "Layerable with our Golden Radiance Body Elixir"
    ],
    ingredients: "Aqua, Alcohol Denat., PEG-40 Hydrogenated Castor Oil, Parfum, Aloe Barbadensis Leaf Extract, Ethylhexylglycerin, Benzyl Alcohol.",
    howToUse: "Spray liberally all over your body and hair whenever you crave a comforting, alluring scent boost."
  },
  {
    id: "sculpting-rose-quartz-roller",
    name: "Sculpting Rose Quartz Face Roller & Gua Sha Set",
    category: "accessories",
    categoryName: "Beauty Accessories",
    price: 2200,
    originalPrice: 2800,
    rating: 4.9,
    reviewCount: 142,
    badge: "Best Seller",
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    image: "assets/images/roller-quartz.jpg",
    shortDesc: "100% authentic natural rose quartz stones to relieve tension, depuff, and sculpt facial contours.",
    description: "Handcrafted from genuine Brazilian rose quartz crystal known as the stone of unconditional love and beauty. Daily facial rolling and gua sha scraping stimulates lymphatic drainage, sculpts cheekbones and jawlines, and dramatically reduces morning puffiness.",
    keyBenefits: [
      "Natural cooling stone instantly de-puffs and calms inflammation",
      "Dramatically improves absorption of serums and facial oils",
      "Sculpts facial muscles and relieves jaw clenching tension",
      "Comes nestled in a luxury satin-lined keepsake magnetic box"
    ],
    ingredients: "100% Natural Brazilian Rose Quartz stone, zinc alloy gold-plated hardware with noise-free silicone inserts.",
    howToUse: "Apply 3-4 drops of Luminous Glow Serum or Golden Elixir. Use the roller from the center of face rolling outward and upward. Use the curved Gua Sha tool at a 15-degree angle along jawline and cheekbones 5 times each."
  },
  {
    id: "velvet-plush-sponge-duo",
    name: "Velvet Plush Powder Puff & Blending Sponge Duo",
    category: "accessories",
    categoryName: "Beauty Accessories",
    price: 1200,
    originalPrice: 1500,
    rating: 4.8,
    reviewCount: 99,
    badge: "Must Have",
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    image: "assets/images/sponge-duo.jpg",
    shortDesc: "Ultra-soft micro-fiber beauty blending sponge and precision triangle powder puff for an airbrushed, poreless finish.",
    description: "The makeup artist's secret weapon for an immaculate, filter-like complexion. Features our tear-drop water-expandable beauty sponge for streak-free foundation blending alongside our signature triangle velvet puff for crease-free baking and touch-ups.",
    keyBenefits: [
      "Expands 2x its size when dampened for skin-like sheer to full coverage",
      "Latex-free, hypoallergenic material absorbs minimal product",
      "Triangle puff fits perfectly under tear troughs and around nose wings",
      "Easily washable with warm water and gentle soap"
    ],
    ingredients: "Hydrophilic Non-Latex Polyurethane foam, Ultra-fine Cotton Velvet fabric, Satin finger ribbon.",
    howToUse: "Wet the sponge with water and squeeze out excess until damp; bounce foundation across skin. Use dry triangle puff to press loose translucent powder under eyes and across T-zone."
  }
];

// Helper functions for easy consumption across components
const MidevaCatalog = {
  getAll: () => MIDEVA_PRODUCTS,
  getById: (id) => MIDEVA_PRODUCTS.find(p => p.id === id),
  getFeatured: () => MIDEVA_PRODUCTS.filter(p => p.isFeatured),
  getBestSellers: () => MIDEVA_PRODUCTS.filter(p => p.isBestSeller),
  getByCategory: (cat) => {
    if (!cat || cat.toLowerCase() === "all") return MIDEVA_PRODUCTS;
    return MIDEVA_PRODUCTS.filter(p => p.category.toLowerCase() === cat.toLowerCase());
  },
  search: (query) => {
    if (!query) return MIDEVA_PRODUCTS;
    const q = query.toLowerCase().trim();
    return MIDEVA_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.categoryName.toLowerCase().includes(q) ||
      p.shortDesc.toLowerCase().includes(q)
    );
  },
  formatKSh: (amount) => {
    return "KSh " + Number(amount || 0).toLocaleString("en-KE");
  },
  renderStars: (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    let html = '<div class="star-rating" aria-label="' + rating + ' out of 5 stars">';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        html += '<span class="star star-filled">★</span>';
      } else if (i === fullStars && hasHalf) {
        html += '<span class="star star-half">★</span>';
      } else {
        html += '<span class="star star-empty">☆</span>';
      }
    }
    html += ' <span class="rating-num">(' + rating.toFixed(1) + ')</span></div>';
    return html;
  }
};

// Export to window for vanilla scripts
if (typeof window !== "undefined") {
  window.MIDEVA_PRODUCTS = MIDEVA_PRODUCTS;
  window.MidevaCatalog = MidevaCatalog;
}
