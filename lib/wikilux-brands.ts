// NOTE: This file is no longer the source of truth for public brand routing.
// Public brand pages resolve from wikilux_content in Supabase by slug.
// This array is kept only for optional metadata or curated homepage usage.
// Do NOT patch slug mismatches here — fix them in the database instead.

export interface Brand {
  slug: string
  name: string
  country: string
  founded: number
  sector: string
  group: string
  headquarters: string
  description: string
  hiring_profile: string
  known_for: string
}

export const BRANDS: Brand[] = [
  // ─────────────────────────────────────────────
  // FASHION & LEATHER GOODS (35)
  // ─────────────────────────────────────────────
  {
    slug: "chanel",
    name: "Chanel",
    country: "France",
    founded: 1910,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Founded by Gabrielle 'Coco' Chanel, the house revolutionized women's fashion by introducing comfort, simplicity, and liberating silhouettes. Chanel remains one of the last great independent French luxury houses, synonymous with timeless Parisian elegance. Its iconic tweed suits, quilted handbags, and No. 5 fragrance are pillars of 20th-century style.",
    hiring_profile:
      "Chanel seeks refined professionals who embody discretion, craftsmanship, and creative excellence. Candidates are expected to demonstrate deep cultural sensitivity and an unwavering commitment to the house's codes and heritage.",
    known_for: "Tweed suits, 2.55 handbag, No. 5 perfume, Little black dress, Haute couture",
  },
  {
    slug: "hermes",
    name: "Hermès",
    country: "France",
    founded: 1837,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Hermès began as a harness workshop serving European noblemen and has evolved into the ultimate symbol of quiet luxury and artisanal excellence. The family-controlled house is renowned for its uncompromising standards in leatherwork, with each Birkin and Kelly bag handcrafted by a single artisan. Hermès represents the pinnacle of understated, enduring quality in the luxury world.",
    hiring_profile:
      "Hermès values artisans and professionals with patience, precision, and a genuine passion for handcraft. The house favors long-term thinkers who respect tradition while contributing creative energy to its métiers.",
    known_for: "Birkin bag, Kelly bag, Silk scarves, Equestrian heritage, Artisanal craftsmanship",
  },
  {
    slug: "louis-vuitton",
    name: "Louis Vuitton",
    country: "France",
    founded: 1854,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Louis Vuitton started as a trunk-maker for Parisian aristocracy and has grown into the world's most valuable luxury brand. The Maison is defined by its spirit of travel and innovation, from flat-topped trunks to the iconic Monogram canvas. Under LVMH, it has expanded into ready-to-wear, shoes, watches, and jewellery while maintaining its leather goods supremacy.",
    hiring_profile:
      "Louis Vuitton recruits ambitious, globally minded talent who thrive in a fast-paced, high-performance environment. Candidates should demonstrate entrepreneurial spirit and a strong sensitivity to brand storytelling and visual culture.",
    known_for: "Monogram canvas, Travel trunks, Keepall, Neverfull, Global retail presence",
  },
  {
    slug: "dior",
    name: "Dior",
    country: "France",
    founded: 1946,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Christian Dior transformed post-war fashion with the revolutionary 'New Look' in 1947, restoring Parisian couture to global prominence. The house stands for femininity, grandeur, and theatrical elegance across haute couture, ready-to-wear, and beauty. Dior remains one of the most influential and commercially powerful fashion houses in the world.",
    hiring_profile:
      "Dior looks for talent with a strong aesthetic sensibility, passion for couture craftsmanship, and the ability to operate within a prestigious, high-visibility brand. The house values cultural awareness, attention to detail, and a collaborative yet ambitious mindset.",
    known_for: "New Look, Bar jacket, Lady Dior bag, Haute couture, J'Adore fragrance",
  },
  {
    slug: "givenchy",
    name: "Givenchy",
    country: "France",
    founded: 1952,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Hubert de Givenchy founded his house on the principles of elegance and refinement, famously dressing Audrey Hepburn and defining mid-century chic. The Maison is known for its aristocratic sensibility and bold creative reinventions under successive artistic directors. Givenchy bridges classic French couture with contemporary streetwear influences.",
    hiring_profile:
      "Givenchy seeks creative and culturally attuned professionals who can navigate between heritage codes and modern fashion currents. Candidates should be comfortable with creative disruption while respecting the house's legacy of refined elegance.",
    known_for: "Audrey Hepburn partnership, Antigona bag, Couture elegance, Shark Lock boots, Streetwear fusion",
  },
  {
    slug: "celine",
    name: "Celine",
    country: "France",
    founded: 1945,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Celine was founded as a children's shoe brand and transformed into a powerhouse of intellectual minimalism under Phoebe Philo's tenure. The house is celebrated for its clean, architectural approach to women's wardrobes and its cult leather goods. Under Hedi Slimane and beyond, Celine has expanded its reach while maintaining its aura of understated Parisian cool.",
    hiring_profile:
      "Celine attracts talent with a refined, minimalist aesthetic sensibility and an appreciation for quiet luxury. The house values individuals who combine commercial acumen with a deep understanding of contemporary culture and design.",
    known_for: "Luggage tote, Minimalist design, Parisian chic, Triomphe bag, Intellectual fashion",
  },
  {
    slug: "loewe",
    name: "Loewe",
    country: "Spain",
    founded: 1846,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Madrid",
    description:
      "Loewe is Spain's oldest luxury house, founded as a collective of leather artisans in Madrid. Under creative director Jonathan Anderson, the brand has been revitalized as a leader in craft-driven, art-infused fashion. Loewe is renowned for its extraordinary leather manipulation techniques and its deep commitment to supporting global craft traditions.",
    hiring_profile:
      "Loewe seeks curious, culturally engaged individuals who appreciate the intersection of craft, art, and fashion. The house values creative thinkers with a global perspective and a genuine passion for artisanal excellence.",
    known_for: "Puzzle bag, Leather craftsmanship, Craft Prize, Jonathan Anderson, Art collaborations",
  },
  {
    slug: "fendi",
    name: "Fendi",
    country: "Italy",
    founded: 1925,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Rome",
    description:
      "Fendi began as a fur and leather shop in Rome and rose to global prominence through its long collaboration with Karl Lagerfeld. The house is celebrated for its innovative fur techniques, the iconic Baguette bag, and its playful approach to Roman luxury. Fendi blends Italian craftsmanship with bold, often whimsical design across fashion, accessories, and home.",
    hiring_profile:
      "Fendi looks for dynamic professionals who appreciate Italian craftsmanship and bring creative energy to a heritage brand. Candidates should demonstrate a balance of innovation and respect for the house's artisanal traditions and Roman identity.",
    known_for: "Baguette bag, Double F logo, Fur innovation, Roman heritage, Peekaboo bag",
  },
  {
    slug: "valentino",
    name: "Valentino",
    country: "Italy",
    founded: 1960,
    sector: "Fashion",
    group: "Kering",
    headquarters: "Rome",
    description:
      "Valentino Garavani built his house on the ideal of absolute glamour, with the signature Valentino Red becoming a symbol of Italian haute couture. The Maison is synonymous with romantic, opulent eveningwear and red-carpet dressing. Under Kering's ownership, Valentino continues to define modern luxury through its couture savoir-faire and emotional storytelling.",
    hiring_profile:
      "Valentino seeks passionate individuals with a deep appreciation for couture, romance, and Italian culture. The house values emotional intelligence, creativity, and the ability to translate heritage codes into contemporary relevance.",
    known_for: "Valentino Red, Rockstud, Haute couture, Red carpet gowns, Roman glamour",
  },
  {
    slug: "balenciaga",
    name: "Balenciaga",
    country: "France",
    founded: 1917,
    sector: "Fashion",
    group: "Kering",
    headquarters: "Paris",
    description:
      "Founded by Cristóbal Balenciaga, revered by peers as 'the master of us all,' the house pioneered sculptural silhouettes and architectural construction in couture. After decades of dormancy, the brand was reborn as a cultural phenomenon blending high fashion with streetwear and irony. Balenciaga consistently pushes boundaries and provokes conversation in contemporary fashion.",
    hiring_profile:
      "Balenciaga seeks bold, culturally aware talent who thrive in a provocative, boundary-pushing creative environment. Candidates should be comfortable with disruption and possess a strong understanding of youth culture and digital media.",
    known_for: "City bag, Triple S sneaker, Architectural silhouettes, Cultural provocation, Streetwear-luxury fusion",
  },
  {
    slug: "saint-laurent",
    name: "Saint Laurent",
    country: "France",
    founded: 1961,
    sector: "Fashion",
    group: "Kering",
    headquarters: "Paris",
    description:
      "Yves Saint Laurent revolutionized fashion by introducing Le Smoking tuxedo for women and bringing ready-to-wear to the couture world. The house embodies Parisian rock 'n' roll glamour, sexual liberation, and artistic audacity. Saint Laurent remains a cultural touchstone for modern, empowered dressing that blurs gender boundaries.",
    hiring_profile:
      "Saint Laurent seeks confident, edgy professionals who understand the intersection of fashion, music, and nightlife culture. The house values individuals with strong visual instincts and an innate sense of cool sophistication.",
    known_for: "Le Smoking tuxedo, Rock 'n' roll aesthetic, Mondrian dress, Left Bank chic, Gender-fluid fashion",
  },
  {
    slug: "bottega-veneta",
    name: "Bottega Veneta",
    country: "Italy",
    founded: 1966,
    sector: "Fashion",
    group: "Kering",
    headquarters: "Vicenza",
    description:
      "Bottega Veneta built its identity on the motto 'When your own initials are enough,' eschewing visible logos in favor of its signature intrecciato woven leather. The house represents the apex of stealth wealth and Italian artisanal mastery. Its leather goods are crafted in the Veneto region by highly skilled artisans using techniques passed down through generations.",
    hiring_profile:
      "Bottega Veneta seeks understated, quality-obsessed professionals who value substance over spectacle. Candidates should demonstrate deep appreciation for craftsmanship and a sophisticated understanding of discreet luxury.",
    known_for: "Intrecciato weave, Stealth wealth, Artisanal leather, Pouch clutch, Logo-free luxury",
  },
  {
    slug: "gucci",
    name: "Gucci",
    country: "Italy",
    founded: 1921,
    sector: "Fashion",
    group: "Kering",
    headquarters: "Florence",
    description:
      "Gucci was founded in Florence as a leather goods house inspired by British aristocratic tastes and equestrian culture. The brand has reinvented itself repeatedly, from Tom Ford's provocative glamour to Alessandro Michele's maximalist eclecticism. Gucci is one of the world's most recognized and commercially powerful luxury brands, known for bold self-expression.",
    hiring_profile:
      "Gucci looks for passionate, diverse talent who embrace self-expression and progressive values. The house values inclusivity, creative ambition, and the ability to connect with a global, digitally native audience.",
    known_for: "GG monogram, Horsebit loafer, Bamboo bag, Flora print, Maximalist aesthetic",
  },
  {
    slug: "prada",
    name: "Prada",
    country: "Italy",
    founded: 1913,
    sector: "Fashion",
    group: "Prada Group",
    headquarters: "Milan",
    description:
      "Prada began as a leather goods shop and was transformed by Miuccia Prada into fashion's most intellectual and subversive house. The brand is celebrated for challenging conventional notions of beauty, embracing 'ugly chic,' and consistently anticipating cultural shifts. Prada occupies a unique space where high fashion meets contemporary art and architectural thinking.",
    hiring_profile:
      "Prada seeks intellectually curious individuals who bring unconventional thinking and cultural depth to their work. The house values analytical minds who can operate at the intersection of commerce, culture, and avant-garde design.",
    known_for: "Nylon bags, Re-Nylon sustainability, Intellectual fashion, Ugly chic, Fondazione Prada",
  },
  {
    slug: "miu-miu",
    name: "Miu Miu",
    country: "Italy",
    founded: 1993,
    sector: "Fashion",
    group: "Prada Group",
    headquarters: "Milan",
    description:
      "Miu Miu is Miuccia Prada's more personal, rebellious label, named after her family nickname. The brand channels youthful irreverence, feminine subversion, and a playful approach to luxury fashion. Miu Miu has become a cultural phenomenon particularly among younger luxury consumers, known for its ability to set viral trends.",
    hiring_profile:
      "Miu Miu seeks youthful, culturally connected professionals who understand the power of irreverence and feminine rebellion in fashion. Candidates should bring fresh perspectives and an instinctive grasp of emerging cultural trends.",
    known_for: "Micro mini skirts, Youthful rebellion, Embellished flats, Wander bag, Viral fashion moments",
  },
  {
    slug: "burberry",
    name: "Burberry",
    country: "United Kingdom",
    founded: 1856,
    sector: "Fashion",
    group: "Independent",
    headquarters: "London",
    description:
      "Burberry was founded by Thomas Burberry, who invented gabardine waterproof fabric and outfitted polar explorers and World War I soldiers. The house's iconic check pattern and trench coat are among the most recognizable symbols in fashion. Burberry bridges British heritage with contemporary innovation, pioneering digital luxury and inclusive brand storytelling.",
    hiring_profile:
      "Burberry seeks forward-thinking talent who respect British heritage while embracing digital innovation and creative modernity. The house values diversity, sustainability commitment, and an entrepreneurial approach to luxury retail.",
    known_for: "Trench coat, Nova check, Gabardine fabric, Digital innovation, British heritage",
  },
  {
    slug: "versace",
    name: "Versace",
    country: "Italy",
    founded: 1978,
    sector: "Fashion",
    group: "Capri Holdings",
    headquarters: "Milan",
    description:
      "Gianni Versace created a fashion empire built on bold glamour, Medusa mythology, and unapologetic sensuality. The house is defined by its vibrant prints, gold hardware, and body-celebrating silhouettes that became synonymous with supermodel culture. Under Donatella Versace's stewardship, the brand continues to champion confidence, color, and Mediterranean extravagance.",
    hiring_profile:
      "Versace seeks bold, energetic professionals who are not afraid of glamour and spectacle. Candidates should embody confidence, have a passion for pop culture, and bring dynamic energy to a fast-paced, celebrity-driven brand.",
    known_for: "Medusa logo, Baroque prints, Safety-pin dress, Supermodel era, Bold glamour",
  },
  {
    slug: "dolce-gabbana",
    name: "Dolce & Gabbana",
    country: "Italy",
    founded: 1985,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Milan",
    description:
      "Domenico Dolce and Stefano Gabbana built their house on a celebration of Italian sensuality, Sicilian heritage, and Mediterranean culture. The brand is known for its corseted dresses, bold animal prints, and devotion to la dolce vita. Dolce & Gabbana has expanded into Alta Moda couture, creating spectacular one-of-a-kind pieces for the global elite.",
    hiring_profile:
      "Dolce & Gabbana seeks passionate individuals who connect deeply with Italian culture, family values, and Mediterranean aesthetics. The house values warmth, dedication, and a flair for theatrical, emotionally driven storytelling.",
    known_for: "Sicilian heritage, Corseted dresses, Alta Moda couture, Animal prints, Italian sensuality",
  },
  {
    slug: "giorgio-armani",
    name: "Giorgio Armani",
    country: "Italy",
    founded: 1975,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Milan",
    description:
      "Giorgio Armani redefined modern power dressing by deconstructing the suit jacket and introducing fluid, understated elegance to both men's and women's fashion. The privately held empire spans fashion, interiors, hotels, and restaurants, all unified by a philosophy of refined simplicity. Armani is one of fashion's most commercially successful independent empires.",
    hiring_profile:
      "Armani seeks disciplined, elegant professionals who embody the brand's philosophy of understated sophistication. Candidates should demonstrate impeccable taste, attention to detail, and a commitment to timeless design over fleeting trends.",
    known_for: "Unstructured blazer, Power dressing, Red carpet gowns, Armani Hotel, Understated elegance",
  },
  {
    slug: "ermenegildo-zegna",
    name: "Ermenegildo Zegna",
    country: "Italy",
    founded: 1910,
    sector: "Fashion",
    group: "Zegna Group",
    headquarters: "Trivero",
    description:
      "Zegna began as a wool mill in the Italian Alps and has become the world's leading luxury menswear fabric producer and brand. The company controls every step from fiber sourcing to finished garment, owning sheep farms in Australia and weaving mills in Trivero. Zegna represents the finest in Italian textile heritage and vertical integration in luxury.",
    hiring_profile:
      "Zegna seeks professionals with deep appreciation for textiles, vertical manufacturing, and sustainable luxury practices. The house values technical expertise, environmental consciousness, and a long-term vision aligned with family-business values.",
    known_for: "Fine fabrics, Vertical integration, Menswear excellence, Oasi Zegna, Sustainable wool",
  },
  {
    slug: "brioni",
    name: "Brioni",
    country: "Italy",
    founded: 1945,
    sector: "Fashion",
    group: "Kering",
    headquarters: "Rome",
    description:
      "Brioni is the definitive name in Italian luxury tailoring, dressing world leaders, Hollywood icons, and discerning gentlemen since 1945. Founded in Rome, the house is renowned for its bespoke suits crafted by master tailors trained through a rigorous four-year apprenticeship. Now part of Kering, Brioni upholds the highest standards of sartorial excellence and handcrafted Italian menswear.",
    hiring_profile:
      "Brioni seeks professionals with a deep appreciation for tailoring tradition, Italian craftsmanship, and discreet luxury. The house values precision, patience, and an understanding of the bespoke client relationship.",
    known_for: "Bespoke tailoring, Italian menswear, Roman elegance, James Bond suits, Master tailors",
  },
  {
    slug: "brunello-cucinelli",
    name: "Brunello Cucinelli",
    country: "Italy",
    founded: 1978,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Solomeo",
    description:
      "Brunello Cucinelli built his cashmere empire in the medieval hamlet of Solomeo, championing a philosophy of 'humanistic capitalism' that prioritizes worker dignity, fair wages, and cultural stewardship. The brand represents the pinnacle of quiet luxury through its sumptuous cashmere knitwear and understated Italian sportswear. Cucinelli is admired as much for its ethical business model as for its exceptional products.",
    hiring_profile:
      "Brunello Cucinelli seeks individuals who share the founder's humanistic values and appreciation for slow, thoughtful craftsmanship. Candidates should value work-life balance, community, and the belief that business can be a force for cultural and social good.",
    known_for: "Cashmere knitwear, Humanistic capitalism, Solomeo village, Quiet luxury, Ethical business",
  },
  {
    slug: "loro-piana",
    name: "Loro Piana",
    country: "Italy",
    founded: 1924,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Quarona",
    description:
      "Loro Piana is the world's foremost purveyor of the finest cashmere, vicuña, and wool, sourcing the rarest fibers directly from producers across the globe. The family-founded company has been the fabric supplier of choice for elite fashion houses before launching its own luxury ready-to-wear and accessories. Loro Piana epitomizes invisible luxury through materials of unmatched quality.",
    hiring_profile:
      "Loro Piana seeks knowledgeable professionals with expertise in textiles, raw materials, and the quiet end of luxury. The house values discretion, depth of knowledge, and a genuine passion for the world's finest natural fibers.",
    known_for: "Vicuña fiber, Baby cashmere, Textile expertise, Quiet luxury, Storm System fabric",
  },
  {
    slug: "kiton",
    name: "Kiton",
    country: "Italy",
    founded: 1968,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Naples",
    description:
      "Kiton was founded by Ciro Paone with the mission of creating the world's finest men's suit, handcrafted in Naples using traditional Neapolitan tailoring techniques. Each Kiton suit requires approximately 25 hours of handwork by master tailors. The house represents the absolute pinnacle of sartorial craftsmanship and Neapolitan tailoring tradition.",
    hiring_profile:
      "Kiton values master artisans and professionals who understand the art of Neapolitan tailoring and bespoke excellence. Candidates should bring deep respect for handcraft, patience, and an unwavering commitment to quality over quantity.",
    known_for: "Neapolitan tailoring, Handmade suits, Super 150s fabrics, Sartorial perfection, Master craftsmen",
  },
  {
    slug: "brioni",
    name: "Brioni",
    country: "Italy",
    founded: 1945,
    sector: "Fashion",
    group: "Kering",
    headquarters: "Rome",
    description:
      "Brioni pioneered the concept of the fashion runway for menswear and has dressed heads of state, business titans, and James Bond. The Roman house is celebrated for its impeccable Italian tailoring, combining structured Roman cut with luxurious fabrics. Brioni operates its own tailoring school to ensure the preservation of its artisanal traditions.",
    hiring_profile:
      "Brioni seeks dedicated professionals who value sartorial tradition, precision, and the art of dressing powerful men. The house looks for individuals with a refined sensibility and deep respect for Italian tailoring heritage.",
    known_for: "James Bond suits, Roman tailoring, Menswear runway pioneer, Tailoring school, Power dressing",
  },
  {
    slug: "tom-ford",
    name: "Tom Ford",
    country: "United States",
    founded: 2005,
    sector: "Fashion",
    group: "Estée Lauder",
    headquarters: "New York",
    description:
      "Tom Ford launched his eponymous brand after transforming Gucci and YSL into global powerhouses, bringing his signature blend of glamour, sexuality, and razor-sharp tailoring. The brand spans fashion, eyewear, beauty, and fragrance, all unified by Ford's vision of modern American luxury. Tom Ford represents unapologetic sophistication and red-carpet polish.",
    hiring_profile:
      "Tom Ford seeks polished, driven professionals with an appreciation for glamour, perfection, and the intersection of fashion, film, and culture. Candidates should embody the brand's standard of excellence and meticulous attention to presentation.",
    known_for: "Sharp tailoring, Luxury eyewear, Private Blend fragrances, Hollywood glamour, Sexual sophistication",
  },
  {
    slug: "alexander-mcqueen",
    name: "Alexander McQueen",
    country: "United Kingdom",
    founded: 1992,
    sector: "Fashion",
    group: "Kering",
    headquarters: "London",
    description:
      "Lee Alexander McQueen founded his house on the principles of provocative beauty, technical mastery, and emotional storytelling through fashion. The brand is known for its extraordinary craftsmanship, theatrical runway shows, and the tension between savagery and romance. McQueen continues to push creative boundaries while honoring its founder's legacy of fearless artistry.",
    hiring_profile:
      "Alexander McQueen seeks creatively courageous individuals who value technical excellence and emotional depth in design. The house looks for talent that can balance artistry with commercial viability while respecting the brand's fearless, avant-garde spirit.",
    known_for: "Skull motif, Armadillo shoes, Savage Beauty, Tailoring mastery, Theatrical shows",
  },
  {
    slug: "stella-mccartney",
    name: "Stella McCartney",
    country: "United Kingdom",
    founded: 2001,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "London",
    description:
      "Stella McCartney has been a trailblazer in sustainable luxury fashion since founding her label, refusing to use leather, fur, or exotic skins. The brand proves that luxury and environmental responsibility are not mutually exclusive, pioneering innovative materials and circular design practices. McCartney has become the conscience of the luxury industry and a model for sustainable business.",
    hiring_profile:
      "Stella McCartney seeks purpose-driven professionals passionate about sustainability, innovation, and redefining luxury for a conscious generation. Candidates should demonstrate genuine commitment to environmental values alongside strong creative or commercial skills.",
    known_for: "Sustainable luxury, Vegetarian fashion, Falabella bag, Eco-innovation, Ethical sourcing",
  },
  {
    slug: "lanvin",
    name: "Lanvin",
    country: "France",
    founded: 1889,
    sector: "Fashion",
    group: "Lanvin Group",
    headquarters: "Paris",
    description:
      "Lanvin is the oldest continuously operating French fashion house, founded by Jeanne Lanvin who began by designing clothes for her daughter. The house is celebrated for its mastery of color, particularly Lanvin blue, and its romantic, artistic approach to fashion. Lanvin carries a legacy of Parisian elegance and mother-daughter devotion that continues to define its identity.",
    hiring_profile:
      "Lanvin seeks culturally sophisticated professionals who appreciate the house's unparalleled heritage and artistic legacy. Candidates should bring creative sensitivity, respect for history, and the ability to contribute to the brand's ongoing revitalization.",
    known_for: "Lanvin blue, Mother-daughter logo, Oldest French fashion house, Romantic elegance, Artistic heritage",
  },
  {
    slug: "balmain",
    name: "Balmain",
    country: "France",
    founded: 1945,
    sector: "Fashion",
    group: "Mayhoola",
    headquarters: "Paris",
    description:
      "Pierre Balmain founded his couture house to create fashion of 'jolie madame' elegance, which has been dramatically reinvented under Olivier Rousteing's creative direction. The house is now known for its bold, body-conscious silhouettes, military-inspired embellishments, and powerful social media presence. Balmain bridges Parisian couture tradition with the energy of celebrity culture and digital engagement.",
    hiring_profile:
      "Balmain seeks bold, digitally savvy professionals who understand the power of celebrity culture and social media in modern luxury. Candidates should bring confidence, creative energy, and a passion for diverse, inclusive fashion.",
    known_for: "Military embellishments, Social media strategy, Body-conscious silhouettes, Celebrity dressing, Balmain Army",
  },
  {
    slug: "jacquemus",
    name: "Jacquemus",
    country: "France",
    founded: 2009,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Simon Porte Jacquemus launched his label at 19 as a love letter to the South of France, his late mother, and Mediterranean joie de vivre. The brand has become one of the most successful independent fashion labels of its generation through viral moments, sun-drenched campaigns, and accessible luxury pricing. Jacquemus represents a new model of fashion entrepreneurship built on authenticity and social media mastery.",
    hiring_profile:
      "Jacquemus seeks young, entrepreneurial creatives who share the founder's passion for storytelling, sunshine, and breaking luxury conventions. Candidates should be adaptable, social media native, and comfortable in a fast-growing, founder-led environment.",
    known_for: "Le Chiquito mini bag, Lavender fields show, Mediterranean aesthetic, Viral marketing, Accessible luxury",
  },
  {
    slug: "rick-owens",
    name: "Rick Owens",
    country: "France",
    founded: 1994,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Rick Owens built a singular fashion universe rooted in brutalist architecture, goth sensibility, and draped monochromatic silhouettes. Operating from a concrete fortress in Paris, the designer has cultivated a devoted following that spans fashion, furniture, and cultural production. Owens represents fashion's most uncompromising artistic vision, where darkness meets beauty.",
    hiring_profile:
      "Rick Owens seeks individuals with a strong, unconventional aesthetic sensibility and comfort working in an intensely creative, founder-driven studio. Candidates should appreciate avant-garde design, subculture, and the discipline behind artistic freedom.",
    known_for: "Brutalist aesthetic, Draped silhouettes, Geobasket sneakers, Furniture design, Gothic glamour",
  },
  {
    slug: "maison-margiela",
    name: "Maison Margiela",
    country: "France",
    founded: 1988,
    sector: "Fashion",
    group: "OTB Group",
    headquarters: "Paris",
    description:
      "Martin Margiela founded the most intellectually radical fashion house of the late 20th century, deconstructing garments, challenging authorship, and subverting fashion conventions. The anonymous founder never gave interviews or took runway bows, letting the clothes speak entirely for themselves. Under John Galliano's creative direction, the house has entered a new era of conceptual excellence and viral cultural relevance.",
    hiring_profile:
      "Maison Margiela seeks intellectually curious, convention-defying professionals who value ideas and craft over celebrity and commerce. Candidates should bring a strong conceptual framework and comfort with fashion as an art form.",
    known_for: "Tabi boots, Deconstruction, Four white stitches, Anonymity, Replica line",
  },
  {
    slug: "off-white",
    name: "Off-White",
    country: "Italy",
    founded: 2012,
    sector: "Fashion",
    group: "LVMH",
    headquarters: "Milan",
    description:
      "Off-White was founded by the late Virgil Abloh as a bridge between streetwear culture and high fashion, defined by its signature quotation marks, zip ties, and industrial motifs. The brand became a cultural phenomenon that reshaped luxury's relationship with youth culture, music, and art. Off-White's legacy continues as one of the most influential fashion brands of the 2010s.",
    hiring_profile:
      "Off-White seeks culturally connected, multidisciplinary creatives who operate at the intersection of fashion, art, music, and design. Candidates should embody the brand's spirit of breaking barriers and reimagining what luxury means for a new generation.",
    known_for: "Quotation marks, Diagonal stripes, Streetwear-luxury bridge, Virgil Abloh legacy, Cross-cultural design",
  },
  {
    slug: "acne-studios",
    name: "Acne Studios",
    country: "Sweden",
    founded: 1996,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Stockholm",
    description:
      "Acne Studios began as a creative collective in Stockholm, launching with 100 pairs of raw denim jeans distributed to friends and family. The brand has grown into a global fashion house known for its Scandinavian minimalism, artistic collaborations, and distinctive face logo. Acne Studios represents the intersection of fashion, art, and Nordic design philosophy.",
    hiring_profile:
      "Acne Studios seeks creative, multidisciplinary talent who appreciate the intersection of art, design, and Scandinavian minimalism. Candidates should bring a collaborative spirit, cultural curiosity, and an appreciation for clean, conceptual design.",
    known_for: "Face logo, Scandinavian minimalism, Denim heritage, Musubi bag, Creative collective roots",
  },
  {
    slug: "max-mara",
    name: "Max Mara",
    country: "Italy",
    founded: 1951,
    sector: "Fashion",
    group: "Independent",
    headquarters: "Reggio Emilia",
    description:
      "Max Mara was founded by Achille Maramotti with the vision of bringing Italian haute couture quality to ready-to-wear fashion. The family-owned house is renowned for its iconic camel coat, impeccable tailoring, and wardrobe-building approach to women's fashion. Max Mara represents enduring Italian elegance and the art of investment dressing.",
    hiring_profile:
      "Max Mara seeks polished professionals who value timeless design, Italian craftsmanship, and a pragmatic approach to luxury fashion. The family-owned house values loyalty, discretion, and a long-term commitment to building exceptional wardrobes for women.",
    known_for: "101801 camel coat, Italian tailoring, Investment dressing, Teddy coat, Family ownership",
  },

  // ─────────────────────────────────────────────
  // WATCHES & FINE JEWELLERY (30)
  // ─────────────────────────────────────────────
  {
    slug: "rolex",
    name: "Rolex",
    country: "Switzerland",
    founded: 1905,
    sector: "Watches & Jewellery",
    group: "Independent",
    headquarters: "Geneva",
    description:
      "Rolex is the world's most recognized luxury watch brand, founded by Hans Wilsdorf with the vision of creating reliable, precise wristwatches. The company pioneered the waterproof Oyster case, the self-winding Perpetual movement, and the date-changing Datejust. Rolex represents achievement, precision, and enduring value in the horological world.",
    hiring_profile:
      "Rolex seeks meticulous, dedicated professionals who embody the brand's values of precision, excellence, and long-term commitment. Candidates should demonstrate technical expertise or commercial acumen alongside a deep respect for Swiss watchmaking tradition.",
    known_for: "Submariner, Daytona, Oyster case, Perpetual movement, Prestige and precision",
  },
  {
    slug: "patek-philippe",
    name: "Patek Philippe",
    country: "Switzerland",
    founded: 1839,
    sector: "Watches & Jewellery",
    group: "Independent",
    headquarters: "Geneva",
    description:
      "Patek Philippe is widely regarded as the finest watchmaker in the world, family-owned by the Stern dynasty since 1932. The manufacture has produced some of horology's greatest complications, including the Calibre 89 and the Grandmaster Chime. Patek Philippe's motto, 'You never actually own a Patek Philippe, you merely look after it for the next generation,' defines the brand's philosophy of enduring legacy.",
    hiring_profile:
      "Patek Philippe seeks exceptional watchmakers and professionals who understand the meaning of generational excellence and uncompromising quality. Candidates must demonstrate patience, precision, and a reverence for horological heritage.",
    known_for: "Nautilus, Calatrava, Grand complications, Generational philosophy, Auction records",
  },
  {
    slug: "audemars-piguet",
    name: "Audemars Piguet",
    country: "Switzerland",
    founded: 1875,
    sector: "Watches & Jewellery",
    group: "Independent",
    headquarters: "Le Brassus",
    description:
      "Audemars Piguet has been family-owned since its founding in the Vallée de Joux and remains one of the last independent haute horlogerie manufactures. The Royal Oak, designed by Gérald Genta in 1972, revolutionized luxury watchmaking by introducing the concept of a luxury steel sports watch. Audemars Piguet is celebrated for its daring innovation and deep respect for watchmaking tradition.",
    hiring_profile:
      "Audemars Piguet seeks independent-minded professionals who value innovation within tradition and share the brand's commitment to staying family-owned. Candidates should bring technical excellence or commercial creativity alongside a passion for haute horlogerie.",
    known_for: "Royal Oak, Vallée de Joux, Luxury sports watch pioneer, Family ownership, Code 11.59",
  },
  {
    slug: "iwc-schaffhausen",
    name: "IWC Schaffhausen",
    country: "Switzerland",
    founded: 1868,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "Schaffhausen",
    description:
      "IWC Schaffhausen uniquely bridges Swiss craftsmanship with engineering precision, founded by an American watchmaker in German-speaking Switzerland. The manufacture is renowned for its pilot's watches, Portuguese line, and robust tool watches built for professionals. IWC combines technical innovation with understated, masculine design that appeals to engineers and adventurers alike.",
    hiring_profile:
      "IWC seeks technically minded, engineering-oriented professionals who appreciate functional luxury and purpose-built design. Candidates should demonstrate analytical thinking, a passion for aviation or exploration, and alignment with the brand's no-nonsense approach.",
    known_for: "Pilot's watches, Portugieser, Engineering excellence, Big Pilot, Mark series",
  },
  {
    slug: "jaeger-lecoultre",
    name: "Jaeger-LeCoultre",
    country: "Switzerland",
    founded: 1833,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "Le Sentier",
    description:
      "Jaeger-LeCoultre is known as 'the watchmaker's watchmaker,' having developed over 1,400 calibres and supplied movements to other prestigious houses. The Grande Maison in the Vallée de Joux is one of the few manufactures capable of producing every component of a watch in-house. JLC's Reverso, with its flipping case, is one of horology's most iconic and enduring designs.",
    hiring_profile:
      "Jaeger-LeCoultre seeks deeply knowledgeable horological professionals and enthusiasts who appreciate technical mastery and in-house manufacture. Candidates should bring intellectual curiosity and a passion for the art and science of watchmaking.",
    known_for: "Reverso, In-house movements, Watchmaker's watchmaker, Atmos clock, Master collection",
  },
  {
    slug: "vacheron-constantin",
    name: "Vacheron Constantin",
    country: "Switzerland",
    founded: 1755,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "Geneva",
    description:
      "Vacheron Constantin is the world's oldest continuously operating watch manufacture, founded in Geneva during the Enlightenment. The house is a member of the Holy Trinity of watchmaking and is celebrated for its artistic métiers d'art dials and extraordinary complications. Vacheron Constantin's Maltese cross logo symbolizes nearly three centuries of unbroken horological excellence.",
    hiring_profile:
      "Vacheron Constantin seeks cultured, historically aware professionals who appreciate the significance of being the oldest watch manufacture in continuous operation. Candidates should demonstrate refined taste, patience, and deep respect for artistic and horological tradition.",
    known_for: "Oldest manufacture, Maltese cross, Overseas, Patrimony, Métiers d'art dials",
  },
  {
    slug: "cartier",
    name: "Cartier",
    country: "France",
    founded: 1847,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "Paris",
    description:
      "Cartier is known as 'the jeweller of kings and the king of jewellers,' having created some of history's most iconic jewels for royalty and high society. The Maison pioneered the modern wristwatch with the Santos in 1904 and has created enduring icons including the Love bracelet, Trinity ring, and Tank watch. Cartier represents the pinnacle of French jewellery and watchmaking artistry.",
    hiring_profile:
      "Cartier seeks sophisticated, culturally fluent professionals who understand the art of high jewellery and the power of iconic design. Candidates should demonstrate elegance, commercial intelligence, and a deep appreciation for the Maison's royal heritage.",
    known_for: "Love bracelet, Tank watch, Santos, Trinity ring, Jeweller of kings",
  },
  {
    slug: "van-cleef-arpels",
    name: "Van Cleef & Arpels",
    country: "France",
    founded: 1906,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "Paris",
    description:
      "Van Cleef & Arpels is a Parisian high jewellery house renowned for its poetic, nature-inspired designs and revolutionary Mystery Setting technique. The Maison's Alhambra collection has become one of the most coveted and recognizable motifs in luxury jewellery. Van Cleef & Arpels transforms precious stones into dreamlike narratives of fairy tales, flowers, and celestial wonder.",
    hiring_profile:
      "Van Cleef & Arpels seeks poetic, detail-oriented professionals who share the Maison's love of storytelling through precious materials. Candidates should bring artistic sensibility, gemological knowledge or luxury expertise, and a romantic approach to beauty.",
    known_for: "Alhambra collection, Mystery Setting, Poetic jewellery, Zip necklace, Nature motifs",
  },
  {
    slug: "boucheron",
    name: "Boucheron",
    country: "France",
    founded: 1858,
    sector: "Watches & Jewellery",
    group: "Kering",
    headquarters: "Paris",
    description:
      "Boucheron was the first great jeweller to open on Place Vendôme in Paris and has been creating high jewellery for over 165 years. The house is celebrated for its bold, architectural designs, innovative use of materials, and the iconic Serpent Bohème and Quatre collections. Boucheron represents daring Parisian elegance with a free-spirited, modern approach to high jewellery.",
    hiring_profile:
      "Boucheron seeks creative, progressive professionals who appreciate bold jewellery design and the house's pioneering spirit on Place Vendôme. Candidates should bring a blend of artistic vision and luxury market understanding.",
    known_for: "Place Vendôme, Serpent Bohème, Quatre collection, Architectural design, High jewellery innovation",
  },
  {
    slug: "piaget",
    name: "Piaget",
    country: "Switzerland",
    founded: 1874,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "La Côte-aux-Fées",
    description:
      "Piaget has been a master of ultra-thin watchmaking and high jewellery since its founding in the Swiss Jura mountains. The house is renowned for its record-breaking slim movements, gem-set watches, and the iconic Possession and Limelight collections. Piaget embodies the art of celebration, combining technical prowess with exuberant, joyful design.",
    hiring_profile:
      "Piaget seeks joyful, detail-oriented professionals who appreciate the intersection of ultra-thin watchmaking and high jewellery. Candidates should bring technical knowledge, a celebratory spirit, and an understanding of Piaget's dual identity as watchmaker and jeweller.",
    known_for: "Ultra-thin movements, Altiplano, Possession collection, Gem-set watches, Limelight",
  },
  {
    slug: "chopard",
    name: "Chopard",
    country: "Switzerland",
    founded: 1860,
    sector: "Watches & Jewellery",
    group: "Independent",
    headquarters: "Geneva",
    description:
      "Chopard is a family-owned Swiss house known for its Happy Diamonds concept, Cannes Film Festival partnership, and commitment to ethical luxury. The Scheufele family has led the company since 1963, expanding from watches into high jewellery, accessories, and fragrance. Chopard pioneered the use of Fairmined gold and ethically sourced gemstones in luxury production.",
    hiring_profile:
      "Chopard seeks ethical, quality-driven professionals who share the family's commitment to responsible luxury and joyful design. Candidates should demonstrate sustainability awareness, craftsmanship appreciation, and alignment with the brand's festive, glamorous identity.",
    known_for: "Happy Diamonds, Cannes Film Festival, Fairmined gold, Alpine Eagle, Ethical luxury",
  },
  {
    slug: "bulgari",
    name: "Bulgari",
    country: "Italy",
    founded: 1884,
    sector: "Watches & Jewellery",
    group: "LVMH",
    headquarters: "Rome",
    description:
      "Bulgari was founded as a silversmith shop in Rome and evolved into Italy's greatest jewellery house, celebrated for its bold, colorful designs inspired by Roman architecture and art. The brand is known for its Serpenti collection, record-breaking ultra-thin watches, and a distinctive Mediterranean aesthetic that sets it apart from Parisian jewellers. Bulgari also operates luxury hotels that extend its Roman glamour into hospitality.",
    hiring_profile:
      "Bulgari seeks vibrant, culturally rich professionals who connect with Italian art, Roman heritage, and bold Mediterranean design. Candidates should bring creative confidence, commercial acumen, and a passion for color and architectural beauty.",
    known_for: "Serpenti collection, Octo Finissimo, Roman heritage, Bold color, Tubogas technique",
  },
  {
    slug: "tiffany-and-co",
    name: "Tiffany & Co",
    country: "United States",
    founded: 1837,
    sector: "Watches & Jewellery",
    group: "LVMH",
    headquarters: "New York",
    description:
      "Tiffany & Co is America's most iconic jewellery house, synonymous with the robin's-egg blue box that has signified romance and celebration since the 19th century. The house set the standard for diamond engagement rings with the Tiffany Setting and has been immortalized through 'Breakfast at Tiffany's.' Under LVMH ownership, Tiffany is undergoing a transformation to reassert its position at the pinnacle of global luxury jewellery.",
    hiring_profile:
      "Tiffany & Co seeks passionate, service-oriented professionals who understand the emotional significance of the brand's role in life's milestone moments. Candidates should bring warmth, commercial sophistication, and an appreciation for American luxury heritage.",
    known_for: "Tiffany Blue, Tiffany Setting, Blue box, Breakfast at Tiffany's, Diamond engagement rings",
  },
  {
    slug: "harry-winston",
    name: "Harry Winston",
    country: "United States",
    founded: 1932,
    sector: "Watches & Jewellery",
    group: "Swatch Group",
    headquarters: "New York",
    description:
      "Harry Winston, known as 'the King of Diamonds,' built the most prestigious diamond house in America, owning some of history's most famous gems including the Hope Diamond. The house is renowned for its extraordinary high jewellery creations and its pioneering role in lending diamonds to Hollywood stars for the red carpet. Winston set the standard for American high jewellery through exceptional stone quality and setting artistry.",
    hiring_profile:
      "Harry Winston seeks exceptional professionals with deep gemological expertise and an appreciation for the rarest diamonds and precious stones. Candidates should embody discretion, luxury client service excellence, and a reverence for extraordinary craftsmanship.",
    known_for: "King of Diamonds, Hope Diamond, Red carpet jewellery, Cluster setting, Extraordinary gems",
  },
  {
    slug: "graff",
    name: "Graff",
    country: "United Kingdom",
    founded: 1960,
    sector: "Watches & Jewellery",
    group: "Independent",
    headquarters: "London",
    description:
      "Laurence Graff built one of the world's most important diamond businesses, vertically integrated from mine to finished jewel. Graff has owned and cut some of the largest and most valuable diamonds in history, including the Lesedi La Rona and the Graff Pink. The house represents the ultimate expression of diamond mastery and ultra-high-net-worth jewellery.",
    hiring_profile:
      "Graff seeks consummate professionals with expertise in rare gemstones and experience serving ultra-high-net-worth clients. Candidates must demonstrate the highest level of discretion, gemological knowledge, and personal integrity.",
    known_for: "Record-breaking diamonds, Vertical integration, Lesedi La Rona, Graff Pink, Ultra-luxury jewellery",
  },
  {
    slug: "de-beers",
    name: "De Beers",
    country: "United Kingdom",
    founded: 1888,
    sector: "Watches & Jewellery",
    group: "Anglo American",
    headquarters: "London",
    description:
      "De Beers created the modern diamond industry and coined the immortal slogan 'A Diamond is Forever,' fundamentally shaping the world's relationship with diamonds. The company controls the entire value chain from mining to retail through its De Beers Jewellers brand. De Beers continues to set global standards for diamond grading, ethical sourcing, and industry innovation.",
    hiring_profile:
      "De Beers seeks professionals passionate about diamonds, ethical mining, and building consumer trust in a legacy brand. Candidates should bring expertise in gemology, sustainability, or luxury retail alongside strong ethical values.",
    known_for: "A Diamond is Forever, Diamond mining, Forevermark, Ethical sourcing, Diamond industry pioneer",
  },
  {
    slug: "pomellato",
    name: "Pomellato",
    country: "Italy",
    founded: 1967,
    sector: "Watches & Jewellery",
    group: "Kering",
    headquarters: "Milan",
    description:
      "Pomellato revolutionized the jewellery world by introducing the concept of prêt-à-porter jewellery, bringing color, boldness, and accessibility to fine jewellery design. The Milanese house is celebrated for its Nudo collection, featuring generously sized gemstones in innovative settings. Pomellato represents joyful, wearable Italian jewellery with a distinctly modern, democratic spirit.",
    hiring_profile:
      "Pomellato seeks joyful, design-oriented professionals who appreciate the brand's mission of making fine jewellery accessible and wearable. Candidates should bring warmth, Italian sensibility, and an understanding of color and gemstone artistry.",
    known_for: "Nudo collection, Prêt-à-porter jewellery, Colored gemstones, Milanese design, Bold settings",
  },
  {
    slug: "dior-joaillerie",
    name: "Dior Joaillerie",
    country: "France",
    founded: 1998,
    sector: "Watches & Jewellery",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Dior Joaillerie was established to bring Christian Dior's love of flowers, gardens, and couture into the world of high jewellery. The collection transforms Dior's iconic motifs—roses, butterflies, stars—into extraordinary precious creations. Dior Joaillerie represents the poetic meeting point of haute couture craftsmanship and high jewellery artistry.",
    hiring_profile:
      "Dior Joaillerie seeks artistically gifted professionals who understand the connection between couture design and high jewellery creation. Candidates should bring gemological expertise, creative sensitivity, and a deep appreciation for the Dior universe.",
    known_for: "Rose Dior Bagatelle, Couture-inspired jewellery, Floral motifs, Gem Dior, Precious garden themes",
  },
  {
    slug: "chaumet",
    name: "Chaumet",
    country: "France",
    founded: 1780,
    sector: "Watches & Jewellery",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Chaumet is one of the oldest Parisian jewellery houses, originally jeweller to Napoleon and Empress Joséphine. The Maison is renowned for its extraordinary tiara heritage, having created over 2,500 tiaras throughout its history. Chaumet combines imperial grandeur with a poetic, naturalistic approach to high jewellery design from its historic home on Place Vendôme.",
    hiring_profile:
      "Chaumet seeks historically aware, romantically inclined professionals who appreciate the Maison's imperial legacy and poetic design philosophy. Candidates should bring knowledge of high jewellery, French history, or luxury brand management.",
    known_for: "Tiara heritage, Joséphine collection, Napoleonic history, Place Vendôme, Naturalistic design",
  },
  {
    slug: "messika",
    name: "Messika",
    country: "France",
    founded: 2005,
    sector: "Watches & Jewellery",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Valérie Messika, daughter of a diamond dealer, founded her jewellery house to make diamonds feel modern, dynamic, and wearable for everyday life. The brand is known for its Move collection featuring mobile diamonds and its strong celebrity following. Messika has rapidly established itself as a leading contemporary fine jewellery brand with a fresh, bold aesthetic.",
    hiring_profile:
      "Messika seeks dynamic, fashion-forward professionals who understand how to position diamonds for a younger, modern clientele. Candidates should bring energy, social media savviness, and a passion for making fine jewellery feel accessible and cool.",
    known_for: "Move collection, Mobile diamonds, Modern diamond jewellery, Celebrity following, Wearable luxury",
  },
  {
    slug: "breguet",
    name: "Breguet",
    country: "France",
    founded: 1775,
    sector: "Watches & Jewellery",
    group: "Swatch Group",
    headquarters: "Paris",
    description:
      "Abraham-Louis Breguet is considered the greatest watchmaker in history, having invented the tourbillon, the first wristwatch, and numerous other horological innovations. The house counted Marie Antoinette, Napoleon, and Winston Churchill among its clients. Breguet's legacy of invention forms the foundation of modern watchmaking, with its signature guilloché dials and Breguet hands still defining horological elegance.",
    hiring_profile:
      "Breguet seeks professionals with deep horological knowledge and an appreciation for the inventor who shaped the entire watchmaking industry. Candidates should bring technical understanding, historical awareness, and passion for mechanical innovation.",
    known_for: "Tourbillon invention, Breguet hands, Guilloché dials, Marie Antoinette watch, Horological innovation",
  },
  {
    slug: "blancpain",
    name: "Blancpain",
    country: "Switzerland",
    founded: 1735,
    sector: "Watches & Jewellery",
    group: "Swatch Group",
    headquarters: "Villeret",
    description:
      "Blancpain is the world's oldest watchmaking brand, founded in Villeret and renowned for its commitment to traditional mechanical watchmaking. The house famously declared it has never made a quartz watch and never will. Blancpain's Fifty Fathoms, created in 1953, is the original modern dive watch and remains an icon of tool watch design.",
    hiring_profile:
      "Blancpain seeks purist, tradition-minded professionals who share the brand's absolute commitment to mechanical watchmaking. Candidates should demonstrate passion for horological heritage, ocean conservation, and authentic brand storytelling.",
    known_for: "Fifty Fathoms, Oldest watch brand, No quartz philosophy, Villeret collection, Ocean conservation",
  },
  {
    slug: "omega",
    name: "Omega",
    country: "Switzerland",
    founded: 1848,
    sector: "Watches & Jewellery",
    group: "Swatch Group",
    headquarters: "Biel",
    description:
      "Omega has been the official timekeeper of the Olympic Games and the first watch worn on the Moon during the Apollo 11 mission. The Swiss manufacture is renowned for its precision, durability, and co-axial escapement technology. Omega represents the intersection of precision engineering, space exploration, and sporting achievement.",
    hiring_profile:
      "Omega seeks performance-driven, precision-minded professionals who connect with the brand's legacy of exploration and athletic timing. Candidates should bring technical knowledge, competitive spirit, and an appreciation for Omega's pioneering history.",
    known_for: "Speedmaster Moonwatch, Seamaster, Olympic timing, Moon landing, Co-axial escapement",
  },
  {
    slug: "longines",
    name: "Longines",
    country: "Switzerland",
    founded: 1832,
    sector: "Watches & Jewellery",
    group: "Swatch Group",
    headquarters: "Saint-Imier",
    description:
      "Longines is one of the oldest Swiss watch brands, recognized by its winged hourglass logo—the oldest unchanged trademark in watchmaking. The brand has a deep heritage in aviation timing, equestrian sports, and elegant watchmaking at an accessible luxury price point. Longines represents timeless elegance and technical competence within the Swatch Group portfolio.",
    hiring_profile:
      "Longines seeks elegant, heritage-conscious professionals who understand the brand's positioning as accessible Swiss luxury. Candidates should bring an appreciation for equestrian culture, classic design, and the value of a strong historical brand identity.",
    known_for: "Winged hourglass logo, Equestrian timing, Aviation heritage, Master Collection, Elegant watchmaking",
  },
  {
    slug: "tag-heuer",
    name: "TAG Heuer",
    country: "Switzerland",
    founded: 1860,
    sector: "Watches & Jewellery",
    group: "LVMH",
    headquarters: "La Chaux-de-Fonds",
    description:
      "TAG Heuer has defined Swiss avant-garde watchmaking through its deep connections to motorsport, with the Monaco and Carrera becoming icons of racing culture. The brand pioneered high-frequency chronographs and was the first Swiss watch in space. TAG Heuer embodies the spirit of speed, precision, and daring that connects Swiss watchmaking to the world of competitive sport.",
    hiring_profile:
      "TAG Heuer seeks bold, sport-minded professionals who thrive in a dynamic, performance-driven brand environment. Candidates should bring competitive energy, a passion for motorsport or athletics, and an understanding of engaging younger luxury consumers.",
    known_for: "Monaco, Carrera, Motorsport heritage, Chronograph innovation, Don't Crack Under Pressure",
  },
  {
    slug: "hublot",
    name: "Hublot",
    country: "Switzerland",
    founded: 1980,
    sector: "Watches & Jewellery",
    group: "LVMH",
    headquarters: "Nyon",
    description:
      "Hublot disrupted traditional Swiss watchmaking by introducing the 'Art of Fusion' philosophy, combining unexpected materials like gold with rubber, ceramic, and carbon fiber. The Big Bang collection became one of the most commercially successful luxury sports watches of the 21st century. Hublot appeals to a bold, contemporary clientele through its partnerships with football, art, and music.",
    hiring_profile:
      "Hublot seeks energetic, unconventional professionals who embrace the brand's fusion philosophy and love of sport and entertainment. Candidates should bring boldness, marketing creativity, and comfort with a disruptive luxury positioning.",
    known_for: "Big Bang, Art of Fusion, Material innovation, Football partnerships, Bold design",
  },
  {
    slug: "richard-mille",
    name: "Richard Mille",
    country: "Switzerland",
    founded: 2001,
    sector: "Watches & Jewellery",
    group: "Independent",
    headquarters: "Les Breuleux",
    description:
      "Richard Mille creates some of the most technically extreme and expensive watches in the world, applying Formula 1 engineering principles and aerospace materials to haute horlogerie. The brand's tonneau-shaped cases in carbon TPT, sapphire, and exotic alloys have become status symbols among elite athletes and celebrities. Richard Mille represents the ultimate convergence of high technology and ultra-luxury watchmaking.",
    hiring_profile:
      "Richard Mille seeks technically brilliant, luxury-minded professionals who understand the brand's positioning at the extreme edge of haute horlogerie. Candidates should bring engineering or materials science knowledge alongside experience with ultra-high-net-worth clientele.",
    known_for: "Tonneau case, Carbon TPT, Ultra-light movements, Celebrity athletes, Extreme pricing",
  },
  {
    slug: "a-lange-sohne",
    name: "A. Lange & Söhne",
    country: "Germany",
    founded: 1845,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "Glashütte",
    description:
      "A. Lange & Söhne is Germany's finest watchmaker, revived after reunification by Walter Lange, great-grandson of the founder. The manufacture is celebrated for its distinctive German silver movements, oversized date display, and the exquisite hand-finishing visible through sapphire casebacks. Lange represents the pinnacle of German precision engineering applied to haute horlogerie.",
    hiring_profile:
      "A. Lange & Söhne seeks precision-obsessed professionals who appreciate the unique heritage of German watchmaking and Glashütte tradition. Candidates should demonstrate technical excellence, attention to detail, and an understanding of what distinguishes German from Swiss haute horlogerie.",
    known_for: "Lange 1, German silver movements, Glashütte heritage, Zeitwerk, Double assembly",
  },
  {
    slug: "panerai",
    name: "Panerai",
    country: "Italy",
    founded: 1860,
    sector: "Watches & Jewellery",
    group: "Richemont",
    headquarters: "Florence",
    description:
      "Panerai began as a watchmaking school and instrument supplier for the Italian Navy, creating dive watches for elite frogmen commandos in World War II. The brand's military heritage, cushion-shaped Luminor case, and crown-protecting bridge have made it a cult favorite among watch enthusiasts. Panerai uniquely bridges Italian design sensibility with Swiss watchmaking manufacture.",
    hiring_profile:
      "Panerai seeks adventurous, heritage-minded professionals who connect with the brand's military diving legacy and Italian-Swiss dual identity. Candidates should bring enthusiasm for storytelling, maritime culture, and community-building with passionate collectors.",
    known_for: "Luminor, Crown bridge, Italian Navy heritage, Radiomir, Dive watch legacy",
  },
  {
    slug: "zenith",
    name: "Zenith",
    country: "Switzerland",
    founded: 1865,
    sector: "Watches & Jewellery",
    group: "LVMH",
    headquarters: "Le Locle",
    description:
      "Zenith is one of the last fully integrated Swiss manufactures, renowned for its legendary El Primero movement—the world's first automatic chronograph, launched in 1969. The movement was famously hidden by a watchmaker to save it from destruction during the quartz crisis. Zenith represents the spirit of reaching for the stars, as its name suggests, through precision, innovation, and determination.",
    hiring_profile:
      "Zenith seeks passionate, history-aware professionals who value mechanical innovation and the romance of traditional Swiss watchmaking. Candidates should bring knowledge of horology, brand storytelling, and an appreciation for the El Primero's legendary status.",
    known_for: "El Primero movement, First automatic chronograph, Defy collection, Le Locle manufacture, 1/10th of a second precision",
  },

  // ─────────────────────────────────────────────
  // AUTOMOTIVE (12)
  // ─────────────────────────────────────────────
  {
    slug: "ferrari",
    name: "Ferrari",
    country: "Italy",
    founded: 1947,
    sector: "Automotive",
    group: "Independent",
    headquarters: "Maranello",
    description:
      "Ferrari is the world's most iconic sports car manufacturer, founded by Enzo Ferrari with the sole purpose of funding his racing team. The Prancing Horse emblem represents the pinnacle of Italian automotive passion, engineering excellence, and motorsport dominance. Ferrari's Formula 1 legacy and limited-production road cars make it the most emotionally charged brand in the automotive world.",
    hiring_profile:
      "Ferrari seeks passionate, high-performing engineers and professionals who embody the brand's racing DNA and pursuit of excellence. Candidates must demonstrate technical brilliance, emotional commitment, and the drive to contribute to automotive perfection.",
    known_for: "Prancing Horse, Formula 1, Maranello, V12 engines, Italian passion",
  },
  {
    slug: "lamborghini",
    name: "Lamborghini",
    country: "Italy",
    founded: 1963,
    sector: "Automotive",
    group: "Volkswagen Group",
    headquarters: "Sant'Agata Bolognese",
    description:
      "Ferruccio Lamborghini founded his car company to build a grand tourer that would rival Ferrari, creating a legacy of outrageous, angular supercars that defy convention. The brand is defined by its dramatic scissor doors, aggressive styling, and the fighting bull emblem. Lamborghini represents uncompromising spectacle and audacity in the world of super sports cars.",
    hiring_profile:
      "Lamborghini seeks bold, innovative engineers and professionals who are drawn to the brand's rebellious spirit and spectacular design language. Candidates should bring technical expertise, creative daring, and a passion for pushing automotive boundaries.",
    known_for: "Scissor doors, Countach, Aventador, Fighting bull, Angular design",
  },
  {
    slug: "bentley",
    name: "Bentley",
    country: "United Kingdom",
    founded: 1919,
    sector: "Automotive",
    group: "Volkswagen Group",
    headquarters: "Crewe",
    description:
      "Bentley was founded by W.O. Bentley to build 'a fast car, a good car, the best in its class,' and the marque dominated Le Mans in the 1920s with the legendary Bentley Boys. Today, Bentley represents the art of grand touring, combining hand-crafted British luxury interiors with powerful, refined performance. The Crewe factory is renowned for its bespoke Mulliner division and artisanal woodwork and leather craftsmanship.",
    hiring_profile:
      "Bentley seeks craftspeople and professionals who appreciate the intersection of British luxury, performance engineering, and bespoke personalization. Candidates should demonstrate attention to detail, pride in craftsmanship, and an understanding of grand touring heritage.",
    known_for: "Continental GT, Mulliner bespoke, Hand-crafted interiors, Le Mans heritage, British luxury",
  },
  {
    slug: "rolls-royce",
    name: "Rolls-Royce",
    country: "United Kingdom",
    founded: 1904,
    sector: "Automotive",
    group: "BMW Group",
    headquarters: "Goodwood",
    description:
      "Rolls-Royce Motor Cars has been the definitive symbol of automotive luxury since Charles Rolls and Henry Royce joined forces to create 'the best car in the world.' Every Rolls-Royce is hand-built at the Goodwood factory, with each vehicle offering virtually unlimited bespoke possibilities through the Rolls-Royce Bespoke programme. The Spirit of Ecstasy hood ornament is the most famous emblem in motoring.",
    hiring_profile:
      "Rolls-Royce seeks exceptional artisans and professionals who understand the meaning of 'the best of the best' in luxury. Candidates must demonstrate impeccable standards, creative excellence, and comfort serving the world's most discerning clients.",
    known_for: "Spirit of Ecstasy, Phantom, Bespoke programme, Starlight headliner, Whisper-quiet refinement",
  },
  {
    slug: "aston-martin",
    name: "Aston Martin",
    country: "United Kingdom",
    founded: 1913,
    sector: "Automotive",
    group: "Independent",
    headquarters: "Gaydon",
    description:
      "Aston Martin is the quintessentially British sports car maker, immortalized as James Bond's car of choice since 'Goldfinger' in 1964. The brand combines muscular elegance with grand touring performance, producing some of the most beautiful cars ever designed. Aston Martin represents the romance and drama of British motoring at its most glamorous.",
    hiring_profile:
      "Aston Martin seeks design-driven, passionate professionals who connect with the brand's blend of British elegance and sporting character. Candidates should bring creative energy, automotive expertise, and an appreciation for the brand's cinematic heritage.",
    known_for: "James Bond, DB5, Vantage, British elegance, Grand touring",
  },
  {
    slug: "mclaren",
    name: "McLaren",
    country: "United Kingdom",
    founded: 1963,
    sector: "Automotive",
    group: "Independent",
    headquarters: "Woking",
    description:
      "McLaren brings Formula 1 technology directly to the road, with every car engineered at the McLaren Technology Centre in Woking using aerospace-grade carbon fiber and advanced aerodynamics. Founded by Bruce McLaren, the company's racing DNA runs through every road car it produces. McLaren represents the purest expression of engineering-led performance in the supercar world.",
    hiring_profile:
      "McLaren seeks technically brilliant engineers and professionals who thrive in a data-driven, race-inspired environment. Candidates should bring exceptional analytical skills, a competitive mindset, and passion for pushing the boundaries of automotive technology.",
    known_for: "F1 car, Carbon fiber tub, Formula 1 heritage, 720S, Engineering excellence",
  },
  {
    slug: "bugatti",
    name: "Bugatti",
    country: "France",
    founded: 1909,
    sector: "Automotive",
    group: "Rimac Group",
    headquarters: "Molsheim",
    description:
      "Bugatti was founded by Ettore Bugatti, who believed 'nothing is too beautiful, nothing is too expensive,' creating some of the most exquisite and technically advanced automobiles in history. The modern era Veyron and Chiron have set world speed records while maintaining extraordinary luxury and craftsmanship. Bugatti represents the absolute apex of automotive engineering, art, and exclusivity.",
    hiring_profile:
      "Bugatti seeks extraordinary engineers and artisans capable of working at the extreme limits of automotive performance and luxury. Candidates should bring world-class technical expertise and an appreciation for the marriage of art and engineering.",
    known_for: "Chiron, Veyron, Speed records, Quad-turbo W16, Molsheim atelier",
  },
  {
    slug: "porsche",
    name: "Porsche",
    country: "Germany",
    founded: 1931,
    sector: "Automotive",
    group: "Volkswagen Group",
    headquarters: "Stuttgart",
    description:
      "Porsche has built one of the automotive world's most devoted followings through the 911's iconic rear-engine layout and its dominance at Le Mans and across motorsport. The Stuttgart manufacturer blends everyday usability with genuine performance in a way no other sports car maker has achieved. Porsche has also led the luxury segment's electrification with the Taycan.",
    hiring_profile:
      "Porsche seeks precision-driven engineers and professionals who embody the brand's philosophy of intelligent performance and everyday sportiness. Candidates should bring technical excellence, a passion for driving, and innovative thinking aligned with Porsche's forward-looking vision.",
    known_for: "911, Rear-engine layout, Le Mans victories, Taycan, Everyday sports car",
  },
  {
    slug: "maserati",
    name: "Maserati",
    country: "Italy",
    founded: 1914,
    sector: "Automotive",
    group: "Stellantis",
    headquarters: "Modena",
    description:
      "Maserati was founded by the Maserati brothers in Bologna and carries over a century of Italian racing heritage and grand touring excellence. The Trident logo, inspired by Neptune's fountain in Bologna, symbolizes power, elegance, and Emilian craftsmanship. Maserati occupies a unique space as an Italian luxury brand that combines racing DNA with everyday drivability and distinctive exhaust notes.",
    hiring_profile:
      "Maserati seeks passionate, Italian-spirited professionals who understand the brand's unique positioning between luxury and racing heritage. Candidates should bring automotive expertise, creative energy, and a deep connection to Italian culture and craftsmanship.",
    known_for: "Trident logo, GranTurismo, MC20, Racing heritage, Italian exhaust note",
  },
  {
    slug: "alfa-romeo",
    name: "Alfa Romeo",
    country: "Italy",
    founded: 1910,
    sector: "Automotive",
    group: "Stellantis",
    headquarters: "Turin",
    description:
      "Alfa Romeo is one of the most storied names in motorsport and Italian automotive design, with a heritage that includes pre-war Grand Prix dominance and iconic road cars like the GTV and Spider. The Milanese marque is celebrated for its beautiful design language, emotive driving experience, and the distinctive 'Cuore Sportivo' sporting heart. Alfa Romeo represents the soul and passion of Italian motoring.",
    hiring_profile:
      "Alfa Romeo seeks spirited, design-conscious professionals who feel the emotional pull of Italian automotive heritage. Candidates should bring passion for motorsport, appreciation for beautiful design, and the drive to revitalize one of motoring's most beloved brands.",
    known_for: "Quadrifoglio, Spider, Cuore Sportivo, Italian design, Racing heritage",
  },
  {
    slug: "lotus",
    name: "Lotus",
    country: "United Kingdom",
    founded: 1948,
    sector: "Automotive",
    group: "Geely",
    headquarters: "Hethel",
    description:
      "Lotus was founded by Colin Chapman on the philosophy of 'simplify, then add lightness,' creating some of motorsport's most innovative and successful racing cars. The Norfolk-based manufacturer is renowned for its lightweight engineering, exceptional handling, and driver-focused design. Under Geely ownership, Lotus is expanding into electric hypercars and performance SUVs while maintaining its lightweight ethos.",
    hiring_profile:
      "Lotus seeks innovative, lightweight-thinking engineers and professionals who embrace Colin Chapman's philosophy of elegant simplicity. Candidates should bring creative engineering solutions, a passion for driving dynamics, and enthusiasm for the brand's electrified future.",
    known_for: "Lightweight philosophy, Elise, Emira, Chapman's innovations, Handling excellence",
  },
  {
    slug: "pagani",
    name: "Pagani",
    country: "Italy",
    founded: 1992,
    sector: "Automotive",
    group: "Independent",
    headquarters: "San Cesario sul Panaro",
    description:
      "Horacio Pagani, an Argentine-Italian engineer, founded his atelier to create hypercars that combine scientific precision with Renaissance artistry. Each Pagani is hand-built in a small workshop near Modena, featuring bespoke carbon-titanium composites and obsessive attention to every bolt and surface. Pagani represents the ultimate expression of automotive art as a form of kinetic sculpture.",
    hiring_profile:
      "Pagani seeks artisan-engineers who view automobiles as works of art and share Horacio Pagani's obsession with perfection in every detail. Candidates should bring mastery of materials science, handcraft skills, and an artistic sensibility unusual in the automotive world.",
    known_for: "Zonda, Huayra, Carbon-titanium, Artisanal hypercars, Renaissance engineering",
  },

  // ─────────────────────────────────────────────
  // HOSPITALITY & TRAVEL (20)
  // ─────────────────────────────────────────────
  {
    slug: "aman-resorts",
    name: "Aman Resorts",
    country: "Multiple",
    founded: 1988,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "Multiple",
    description:
      "Aman pioneered the concept of ultra-luxury boutique resorts, with each property designed to harmonize with its natural and cultural surroundings. Founded by Adrian Zecha, Aman properties are defined by minimalist architecture, exceptional privacy, and a serene sense of place. The brand has cultivated a devoted following of 'Aman Junkies' who seek transformative experiences in the world's most extraordinary locations.",
    hiring_profile:
      "Aman seeks intuitive, culturally sensitive hospitality professionals who understand the art of anticipatory, invisible service. Candidates should demonstrate emotional intelligence, discretion, and a genuine passion for creating serene, meaningful guest experiences.",
    known_for: "Minimalist luxury, Aman Junkies, Architectural harmony, Privacy, Serene hospitality",
  },
  {
    slug: "four-seasons",
    name: "Four Seasons",
    country: "Canada",
    founded: 1961,
    sector: "Hospitality",
    group: "Cascade Investment",
    headquarters: "Toronto",
    description:
      "Four Seasons pioneered the modern luxury hotel concept under founder Isadore Sharp, establishing the gold standard for consistent, personalized service across a global portfolio. The company is renowned for its employee-first culture, based on the Golden Rule, which drives its legendary service quality. Four Seasons represents the benchmark for luxury hospitality worldwide.",
    hiring_profile:
      "Four Seasons seeks genuine, empathetic hospitality professionals who live by the Golden Rule and find joy in anticipating guest needs. Candidates should demonstrate warmth, emotional intelligence, and a service-first mindset aligned with the company's people-centered culture.",
    known_for: "Golden Rule culture, Consistent global service, Employee-first philosophy, Luxury benchmark, Personalized experiences",
  },
  {
    slug: "rosewood-hotels",
    name: "Rosewood Hotels",
    country: "Hong Kong",
    founded: 1979,
    sector: "Hospitality",
    group: "New World Development",
    headquarters: "Hong Kong",
    description:
      "Rosewood Hotels operates a collection of ultra-luxury properties under its 'A Sense of Place' philosophy, ensuring each hotel reflects the culture, history, and spirit of its destination. The brand has rapidly expanded from its Texas origins to become a global force in luxury hospitality. Rosewood's properties are known for their distinctive design, residential feel, and deeply localized experiences.",
    hiring_profile:
      "Rosewood seeks culturally curious, design-aware hospitality professionals who can deliver deeply localized luxury experiences. Candidates should bring a passion for storytelling, community engagement, and the ability to create a genuine sense of place for discerning travelers.",
    known_for: "A Sense of Place, Destination-driven design, Carlyle Hotel, Residential luxury, Cultural immersion",
  },
  {
    slug: "belmond",
    name: "Belmond",
    country: "United Kingdom",
    founded: 1976,
    sector: "Hospitality",
    group: "LVMH",
    headquarters: "London",
    description:
      "Belmond curates a collection of iconic hotels, trains, river cruises, and safaris that celebrate the art of travel and the romance of legendary destinations. The collection includes the Hotel Cipriani in Venice, the Orient Express trains, and Cap Juluca in Anguilla. Belmond represents the golden age of travel reimagined for the modern luxury traveler.",
    hiring_profile:
      "Belmond seeks romantic, storytelling-minded hospitality professionals who appreciate the poetry of travel and legendary destinations. Candidates should bring a passion for creating magical moments and an understanding of how hospitality can become an art form.",
    known_for: "Hotel Cipriani, Legendary trains, Romance of travel, Iconic destinations, LVMH hospitality",
  },
  {
    slug: "mandarin-oriental",
    name: "Mandarin Oriental",
    country: "Hong Kong",
    founded: 1963,
    sector: "Hospitality",
    group: "Jardine Matheson",
    headquarters: "Hong Kong",
    description:
      "Mandarin Oriental is a luxury hotel group renowned for its blend of Eastern heritage and Western luxury, delivering exceptional service with Oriental grace. The fan logo symbolizes the brand's Asian roots and its reputation for creating memorable experiences through impeccable attention to detail. Mandarin Oriental properties are celebrated for their award-winning spas, Michelin-starred dining, and prime city-center locations.",
    hiring_profile:
      "Mandarin Oriental seeks graceful, detail-oriented hospitality professionals who embody the brand's blend of Eastern warmth and Western luxury standards. Candidates should demonstrate genuine care, cultural sensitivity, and pride in delivering the brand's signature personalised service.",
    known_for: "Fan logo, Oriental heritage, Award-winning spas, City-center locations, Celebrity fans",
  },
  {
    slug: "six-senses",
    name: "Six Senses",
    country: "Thailand",
    founded: 1995,
    sector: "Hospitality",
    group: "IHG",
    headquarters: "Bangkok",
    description:
      "Six Senses pioneered the concept of wellness-integrated luxury hospitality, creating resorts and spas in extraordinary natural locations that prioritize sustainability and guest wellbeing. The brand is known for its sleep programs, holistic wellness offerings, and commitment to local community engagement. Six Senses represents the convergence of luxury hospitality and conscious living.",
    hiring_profile:
      "Six Senses seeks wellness-minded, environmentally conscious hospitality professionals who believe luxury and sustainability are inseparable. Candidates should demonstrate a genuine commitment to guest wellbeing, community impact, and the brand's pioneering sustainability practices.",
    known_for: "Wellness luxury, Sustainability, Sleep programs, Remote locations, Holistic experiences",
  },
  {
    slug: "bulgari-hotels",
    name: "Bulgari Hotels",
    country: "Italy",
    founded: 2001,
    sector: "Hospitality",
    group: "LVMH/Marriott",
    headquarters: "Milan",
    description:
      "Bulgari Hotels translate the Roman jeweller's bold, contemporary aesthetic into an ultra-luxury hotel experience, with each property designed by Antonio Citterio. The collection brings Bulgari's signature style of Italian glamour, precious materials, and sophisticated entertaining to the world's most desirable cities. Bulgari Hotels represent the successful extension of a jewellery maison's DNA into hospitality.",
    hiring_profile:
      "Bulgari Hotels seek sophisticated, design-conscious hospitality professionals who understand luxury brand extension and Italian glamour. Candidates should bring experience in ultra-luxury service, appreciation for design and detail, and the ability to deliver a jewellery-house standard of excellence.",
    known_for: "Italian design, Antonio Citterio architecture, Jewellery-house hospitality, Urban luxury, Bulgari aesthetic",
  },
  {
    slug: "capella-hotels",
    name: "Capella Hotels",
    country: "Singapore",
    founded: 2002,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "Singapore",
    description:
      "Capella Hotels was founded by Horst Schulze, co-founder of Ritz-Carlton, to create a new standard of ultra-personalized luxury hospitality. Each property is designed to be architecturally significant while delivering an intimately customized guest experience. Capella represents the evolution of luxury hospitality toward bespoke, culturally immersive stays.",
    hiring_profile:
      "Capella seeks exceptional hospitality professionals who understand that true luxury is deeply personal and culturally authentic. Candidates should bring experience from the finest hotels, a passion for personalization, and the service philosophy of founder Horst Schulze.",
    known_for: "Ultra-personalization, Horst Schulze legacy, Architectural significance, Intimate luxury, Cultural immersion",
  },
  {
    slug: "oetker-collection",
    name: "Oetker Collection",
    country: "Germany",
    founded: 1853,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "Baden-Baden",
    description:
      "Oetker Collection curates a portfolio of masterpiece hotels, each representing the finest expression of European hospitality tradition. Properties like the Brenners Park-Hotel in Baden-Baden and Le Bristol Paris are among Europe's most celebrated grand hotels. Oetker Collection embodies the tradition of the European grand hotel with a commitment to timeless elegance and discreet family ownership.",
    hiring_profile:
      "Oetker Collection seeks refined European hospitality professionals who understand grand hotel tradition and the art of discreet, impeccable service. Candidates should bring classical training, multilingual abilities, and a genuine appreciation for European cultural heritage.",
    known_for: "European grand hotels, Le Bristol Paris, Family ownership, Timeless elegance, Brenners Park",
  },
  {
    slug: "the-leading-hotels-of-the-world",
    name: "The Leading Hotels of the World",
    country: "United States",
    founded: 1928,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "New York",
    description:
      "The Leading Hotels of the World is the oldest luxury hotel consortium, representing over 400 independent luxury hotels across 80 countries. The organization serves as a curator and quality standard for the world's finest independently owned hotels and resorts. LHW provides its members with global marketing, distribution, and the prestigious Leaders Club loyalty program.",
    hiring_profile:
      "The Leading Hotels of the World seeks globally minded professionals who understand the independent luxury hotel landscape and the value of curation. Candidates should bring expertise in hospitality marketing, brand standards, or luxury travel distribution.",
    known_for: "Hotel curation, Independent luxury, Leaders Club, Global portfolio, Quality standards",
  },
  {
    slug: "cheval-blanc",
    name: "Cheval Blanc",
    country: "France",
    founded: 2006,
    sector: "Hospitality",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Cheval Blanc is LVMH's ultra-exclusive hotel brand, inspired by the legendary Château Cheval Blanc wine estate in Saint-Émilion. Each Maison is designed as a unique Art de Recevoir experience, combining French savoir-vivre with extraordinary architectural commissions. Cheval Blanc represents the pinnacle of LVMH's hospitality ambitions, with properties in Courchevel, the Maldives, Saint-Barth, and Paris.",
    hiring_profile:
      "Cheval Blanc seeks intuitive, culturally sophisticated hospitality artists who embody French art de recevoir at its most refined. Candidates should bring impeccable taste, fluency in luxury service, and the ability to create deeply personal, memorable experiences.",
    known_for: "Art de Recevoir, LVMH hospitality crown, Courchevel, Paris Samaritaine, Ultra-exclusivity",
  },
  {
    slug: "park-hyatt",
    name: "Park Hyatt",
    country: "United States",
    founded: 1980,
    sector: "Hospitality",
    group: "Hyatt Hotels",
    headquarters: "Chicago",
    description:
      "Park Hyatt represents the luxury tier of Hyatt Hotels, offering refined, residential-style luxury in the world's gateway cities. The brand is known for its understated elegance, contemporary art collections, and intimate scale compared to other luxury hotel brands. Park Hyatt Tokyo gained iconic cultural status through its prominent role in the film 'Lost in Translation.'",
    hiring_profile:
      "Park Hyatt seeks polished, understated hospitality professionals who appreciate residential-style luxury and contemporary art and design. Candidates should bring quiet confidence, cultural awareness, and the ability to create an atmosphere of calm sophistication.",
    known_for: "Residential luxury, Contemporary art, Park Hyatt Tokyo, Understated elegance, Gateway cities",
  },
  {
    slug: "raffles-hotels",
    name: "Raffles Hotels",
    country: "Singapore",
    founded: 1887,
    sector: "Hospitality",
    group: "Accor",
    headquarters: "Singapore",
    description:
      "Raffles is one of the world's most storied hotel brands, named after Sir Stamford Raffles and anchored by the iconic Raffles Hotel Singapore where the Singapore Sling was invented. The brand represents the romance of colonial-era grand travel and has hosted literary legends from Somerset Maugham to Rudyard Kipling. Raffles is expanding globally while maintaining its aura of legendary, literary elegance.",
    hiring_profile:
      "Raffles seeks cultured, service-passionate professionals who appreciate the brand's legendary heritage and literary connections. Candidates should bring warmth, storytelling ability, and the grace to maintain the spirit of a bygone era of grand hospitality.",
    known_for: "Singapore Sling, Colonial grandeur, Literary heritage, Raffles Singapore, Legendary hospitality",
  },
  {
    slug: "baccarat-hotel",
    name: "Baccarat Hotel",
    country: "United States",
    founded: 2015,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "New York",
    description:
      "The Baccarat Hotel New York brings the legendary French crystal house's heritage of brilliance and light into an ultra-luxury hotel experience. Every element of the hotel, from the 15,000 Baccarat crystals in the Grand Salon to the bespoke harcourt glasses, reflects the brand's 260-year mastery of crystal. Baccarat Hotel represents the art of French savoir-vivre translated into American luxury hospitality.",
    hiring_profile:
      "Baccarat Hotel seeks glamorous, detail-obsessed hospitality professionals who appreciate the intersection of French artisanal heritage and New York luxury. Candidates should bring sophistication, an eye for theatrical beauty, and experience in ultra-luxury guest service.",
    known_for: "Crystal chandeliers, Grand Salon, French luxury hospitality, Harcourt glasses, Manhattan glamour",
  },
  {
    slug: "chateau-margaux",
    name: "Château Margaux",
    country: "France",
    founded: 1590,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "Margaux",
    description:
      "Château Margaux is a Premier Grand Cru Classé estate in the Médoc, producing one of the world's most celebrated and expensive Bordeaux wines since the 16th century. The neoclassical château itself is a classified historic monument and one of the most beautiful wine estates in France. Château Margaux represents the absolute pinnacle of Bordeaux winemaking tradition and terroir expression.",
    hiring_profile:
      "Château Margaux seeks dedicated oenological professionals and hospitality experts with deep knowledge of Bordeaux wines and estate management. Candidates should bring reverence for terroir, patience for long-term viticulture, and an understanding of first-growth prestige.",
    known_for: "Premier Grand Cru Classé, Bordeaux excellence, Neoclassical château, Terroir expression, Fine wine investment",
  },
  {
    slug: "orient-express",
    name: "Orient Express",
    country: "France",
    founded: 1883,
    sector: "Hospitality",
    group: "Accor",
    headquarters: "Paris",
    description:
      "The Orient Express is the most legendary train journey in the world, immortalized by Agatha Christie and embodying the golden age of luxury rail travel between Paris and Istanbul. The brand represents romance, mystery, and the art of slow, elegant travel across Europe. Under Accor's stewardship, Orient Express is expanding into hotels and new train routes while preserving its mythical heritage.",
    hiring_profile:
      "Orient Express seeks romantic, service-oriented professionals who understand the magic of journey-based luxury and the art of slow travel. Candidates should bring storytelling ability, attention to period-authentic detail, and a passion for creating unforgettable travel experiences.",
    known_for: "Paris-Istanbul route, Agatha Christie, Golden age of travel, Luxury rail, Romantic journey",
  },
  {
    slug: "soneva",
    name: "Soneva",
    country: "Maldives",
    founded: 1995,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "Maldives",
    description:
      "Soneva pioneered the 'Intelligent Luxury' concept, creating barefoot ultra-luxury resorts that combine hedonistic comfort with rigorous environmental sustainability. Founded by Sonu and Eva Shivdasani, the brand operates resorts in the Maldives and Thailand with a no-news, no-shoes philosophy. Soneva demonstrates that environmental responsibility and extraordinary luxury are not only compatible but mutually enhancing.",
    hiring_profile:
      "Soneva seeks environmentally passionate, hospitality-minded professionals who believe in intelligent luxury and sustainable innovation. Candidates should bring genuine sustainability commitment, warmth, and the ability to create transformative experiences in remote, natural settings.",
    known_for: "Intelligent Luxury, No shoes policy, Sustainability pioneer, Maldives resorts, Barefoot luxury",
  },
  {
    slug: "singita",
    name: "Singita",
    country: "South Africa",
    founded: 1993,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "Johannesburg",
    description:
      "Singita is Africa's leading ultra-luxury conservation and safari brand, operating exclusive lodges and camps across South Africa, Tanzania, Zimbabwe, and Rwanda. The brand's mission is to preserve and protect large areas of African wilderness through sustainable tourism and community partnership. Singita represents the gold standard of luxury safari experiences where conservation drives every decision.",
    hiring_profile:
      "Singita seeks conservation-minded, hospitality professionals with a deep love for African wildlife and wilderness preservation. Candidates should bring passion for environmental stewardship, community development, and delivering extraordinary safari experiences.",
    known_for: "Conservation tourism, Ultra-luxury safaris, African wilderness, Community partnerships, Wildlife preservation",
  },
  {
    slug: "and-beyond",
    name: "&Beyond",
    country: "South Africa",
    founded: 1991,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "Johannesburg",
    description:
      "&Beyond operates luxury experiential travel lodges across Africa, Asia, and South America with a philosophy of 'Care of the Land, Care of the Wildlife, Care of the People.' The brand is known for its intimate camps, expert-guided safari experiences, and transformative encounters with nature. &Beyond has set the standard for responsible luxury travel that benefits local ecosystems and communities.",
    hiring_profile:
      "&Beyond seeks adventurous, purpose-driven professionals who are passionate about wildlife conservation and community upliftment through tourism. Candidates should bring field expertise, cultural sensitivity, and a genuine commitment to the brand's three pillars of care.",
    known_for: "Responsible travel, Safari experiences, Three pillars of care, African lodges, Wildlife encounters",
  },
  {
    slug: "rocco-forte-hotels",
    name: "Rocco Forte Hotels",
    country: "United Kingdom",
    founded: 1996,
    sector: "Hospitality",
    group: "Independent",
    headquarters: "London",
    description:
      "Rocco Forte Hotels is a family-owned collection of luxury hotels across Europe, founded by Sir Rocco Forte and designed by his sister Olga Polizzi. Each property combines warm Italian-British family hospitality with distinctive, contemporary interiors. Rocco Forte Hotels represent the best of European family hotel-keeping tradition with a strong emphasis on design, wellness, and locally inspired experiences.",
    hiring_profile:
      "Rocco Forte Hotels seek warm, family-spirited professionals who value personal attention, design, and the European grand hotel tradition. Candidates should bring genuine hospitality instincts, multilingual abilities, and an appreciation for the family ownership culture.",
    known_for: "Family ownership, European collection, Olga Polizzi design, Italian-British heritage, Hotel de Russie",
  },

  // ─────────────────────────────────────────────
  // BEAUTY, FRAGRANCE & WELLNESS (20)
  // ─────────────────────────────────────────────
  {
    slug: "la-prairie",
    name: "La Prairie",
    country: "Switzerland",
    founded: 1978,
    sector: "Beauty & Fragrance",
    group: "Beiersdorf",
    headquarters: "Zurich",
    description:
      "La Prairie was born from the legendary Clinique La Prairie in Montreux, where pioneering cellular therapy treatments attracted the world's elite. The brand is defined by its science-driven approach to luxury skincare, particularly its Skin Caviar collection featuring caviar extract. La Prairie represents the pinnacle of Swiss precision and innovation in prestige beauty.",
    hiring_profile:
      "La Prairie seeks scientifically minded, luxury-oriented beauty professionals who understand the intersection of Swiss precision and ultra-premium skincare. Candidates should bring scientific credibility, luxury retail expertise, and a passion for advancing the boundaries of skincare innovation.",
    known_for: "Skin Caviar, Swiss cellular science, Platinum Rare, Ultra-luxury skincare, Clinique La Prairie heritage",
  },
  {
    slug: "sisley-paris",
    name: "Sisley Paris",
    country: "France",
    founded: 1976,
    sector: "Beauty & Fragrance",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Sisley Paris is a family-owned French beauty house pioneering phyto-cosmetology, the science of using plant-based active ingredients in luxury skincare. Founded by the d'Ornano family, the brand is known for its research-driven formulations that harness the power of botanicals. Sisley represents the French tradition of combining nature, science, and luxury in skincare and beauty.",
    hiring_profile:
      "Sisley Paris seeks beauty professionals who appreciate the family-owned brand's commitment to botanical science and luxury without compromise. Candidates should bring passion for skincare education, scientific curiosity, and alignment with the d'Ornano family's long-term vision.",
    known_for: "Phyto-cosmetology, Ecological Compound, Family ownership, Botanical skincare, French luxury beauty",
  },
  {
    slug: "creed",
    name: "Creed",
    country: "France",
    founded: 1760,
    sector: "Beauty & Fragrance",
    group: "Kering",
    headquarters: "Paris",
    description:
      "Creed is one of the oldest fragrance houses in the world, claiming a heritage of creating bespoke scents for royalty including Queen Victoria and Napoleon III. The house is renowned for its Aventus fragrance, one of the best-selling luxury perfumes globally, and its traditional infusion method of perfumery. Creed represents the art of old-world fragrance craftsmanship at the highest level.",
    hiring_profile:
      "Creed seeks fragrance-passionate professionals who appreciate the art of traditional perfumery and the brand's royal heritage. Candidates should bring olfactory knowledge, luxury retail expertise, and the ability to convey Creed's artisanal story to discerning clients.",
    known_for: "Aventus, Royal heritage, Infusion method, Artisanal perfumery, Millésime collection",
  },
  {
    slug: "acqua-di-parma",
    name: "Acqua di Parma",
    country: "Italy",
    founded: 1916,
    sector: "Beauty & Fragrance",
    group: "LVMH",
    headquarters: "Parma",
    description:
      "Acqua di Parma captures the essence of Italian elegance through its fragrances, home collections, and grooming products, all presented in the brand's iconic yellow Art Deco packaging. The Colonia fragrance, created in 1916, became the signature scent of Hollywood's golden age and Italian high society. Acqua di Parma represents la dolce vita distilled into a refined lifestyle brand.",
    hiring_profile:
      "Acqua di Parma seeks elegant, Italian-spirited professionals who embody the brand's refined lifestyle and joie de vivre. Candidates should bring an appreciation for Italian craftsmanship, sensory storytelling, and the art of creating beautiful daily rituals.",
    known_for: "Colonia fragrance, Yellow packaging, Italian elegance, Barbiere grooming, Art Deco heritage",
  },
  {
    slug: "diptyque",
    name: "Diptyque",
    country: "France",
    founded: 1961,
    sector: "Beauty & Fragrance",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Diptyque was founded by three artistic friends on Boulevard Saint-Germain, beginning as a boutique selling fabrics and objets d'art before discovering their calling in candle-making and perfumery. The brand's oval label and artistic approach have made its candles and fragrances icons of sophisticated Parisian living. Diptyque represents the Left Bank spirit of artistic creation and olfactory storytelling.",
    hiring_profile:
      "Diptyque seeks artistically inclined, culturally curious professionals who appreciate the brand's bohemian, Left Bank heritage. Candidates should bring a passion for fragrance, artistic sensibility, and an understanding of niche luxury brand building.",
    known_for: "Baies candle, Oval label, Boulevard Saint-Germain, Scented candles, Parisian artistry",
  },
  {
    slug: "byredo",
    name: "Byredo",
    country: "Sweden",
    founded: 2006,
    sector: "Beauty & Fragrance",
    group: "LVMH",
    headquarters: "Stockholm",
    description:
      "Byredo was founded by Ben Gorham, a former basketball player of Indian-Swedish heritage, who channels memories and emotions into minimalist, evocative fragrances. The brand's Scandinavian-designed packaging and conceptual approach to scent have made it a favorite of the creative and fashion industries. Byredo represents a new generation of fragrance brands that prioritize emotion, memory, and design over traditional perfumery conventions.",
    hiring_profile:
      "Byredo seeks creative, design-conscious professionals from diverse backgrounds who understand the power of fragrance as emotional storytelling. Candidates should bring cultural fluency, visual sensitivity, and an appreciation for the brand's minimalist, conceptual approach.",
    known_for: "Gypsy Water, Bal d'Afrique, Minimalist design, Emotional perfumery, Scandinavian aesthetic",
  },
  {
    slug: "maison-margiela-fragrances",
    name: "Maison Margiela Fragrances",
    country: "France",
    founded: 2010,
    sector: "Beauty & Fragrance",
    group: "L'Oréal",
    headquarters: "Paris",
    description:
      "Maison Margiela Fragrances, particularly the 'Replica' line, captures specific moments and places through scent, translating memories like 'By the Fireplace,' 'Jazz Club,' and 'Lazy Sunday Morning' into perfume. The collection applies Margiela's conceptual, deconstructionist approach to fragrance in an accessible, story-driven format. The Replica line has become one of the most commercially successful niche fragrance concepts in the market.",
    hiring_profile:
      "Maison Margiela Fragrances seeks storytelling-oriented beauty professionals who understand the power of memory and emotion in fragrance. Candidates should bring creative communication skills and the ability to translate conceptual ideas into engaging consumer experiences.",
    known_for: "Replica line, Memory-based scents, By the Fireplace, Conceptual fragrance, Accessible niche",
  },
  {
    slug: "frederic-malle",
    name: "Frederic Malle",
    country: "France",
    founded: 2000,
    sector: "Beauty & Fragrance",
    group: "Estée Lauder",
    headquarters: "Paris",
    description:
      "Frédéric Malle created the concept of 'Editions de Parfums,' treating perfumers as authors and giving them complete creative freedom to create masterworks without commercial compromise. The grandson of Dior perfume creator Serge Heftler, Malle curates a collection of fragrances by the world's greatest noses. Frederic Malle represents the most uncompromising, intellectual approach to fine perfumery.",
    hiring_profile:
      "Frederic Malle seeks knowledgeable, intellectually driven fragrance professionals who can articulate the artistry behind each perfumer's creation. Candidates should bring deep olfactory education, editorial sensibility, and the ability to guide clients through a curated, author-driven collection.",
    known_for: "Editions de Parfums, Portrait of a Lady, Perfumer-as-author, Intellectual fragrance, Uncompromising quality",
  },
  {
    slug: "le-labo",
    name: "Le Labo",
    country: "United States",
    founded: 2006,
    sector: "Beauty & Fragrance",
    group: "Estée Lauder",
    headquarters: "New York",
    description:
      "Le Labo disrupted the fragrance industry with its apothecary-style approach, hand-blending each fragrance to order and labeling bottles with the buyer's name and date. The brand's city-exclusive scents and industrial-chic aesthetic have created a devoted global cult following. Le Labo represents the democratization of niche perfumery through transparent, ritualistic, and deeply personal service.",
    hiring_profile:
      "Le Labo seeks authentic, community-minded professionals who embrace the brand's artisanal, anti-marketing philosophy. Candidates should bring genuine passion for craft, a rejection of pretension, and the ability to create personal connections with customers.",
    known_for: "Santal 33, Hand-blended to order, City exclusives, Apothecary aesthetic, Cult following",
  },
  {
    slug: "serge-lutens",
    name: "Serge Lutens",
    country: "France",
    founded: 1992,
    sector: "Beauty & Fragrance",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Serge Lutens is an artist, photographer, and perfumer who created some of the most daring and poetic fragrances in the industry, first through his work with Shiseido and then under his own name. His perfume palace, Les Salons du Palais Royal, is a destination for fragrance connoisseurs worldwide. Lutens represents the most artistic, uncompromising vision in niche perfumery, where each scent is a work of art.",
    hiring_profile:
      "Serge Lutens seeks artistically devoted professionals who understand fragrance as fine art and share the founder's uncompromising creative vision. Candidates should bring deep olfactory knowledge, artistic appreciation, and comfort with a highly curated, niche brand identity.",
    known_for: "Palais Royal salon, Ambre Sultan, Artistic perfumery, Shiseido legacy, Uncompromising vision",
  },
  {
    slug: "jo-malone-london",
    name: "Jo Malone London",
    country: "United Kingdom",
    founded: 1994,
    sector: "Beauty & Fragrance",
    group: "Estée Lauder",
    headquarters: "London",
    description:
      "Jo Malone London introduced the concept of fragrance combining, encouraging customers to layer scents to create their own unique signature. The brand's cream and black packaging, elegant simplicity, and British sensibility have made it a global leader in lifestyle fragrance. Jo Malone London represents accessible luxury fragrance with a distinctly British charm and playful approach to scent.",
    hiring_profile:
      "Jo Malone London seeks warm, knowledgeable fragrance professionals who excel at creating personalized scent experiences through the art of combining. Candidates should bring exceptional client engagement skills, British elegance, and a passion for fragrance education and gifting.",
    known_for: "Fragrance combining, Lime Basil & Mandarin, Cream packaging, British elegance, Scent layering",
  },
  {
    slug: "tom-ford-beauty",
    name: "Tom Ford Beauty",
    country: "United States",
    founded: 2006,
    sector: "Beauty & Fragrance",
    group: "Estée Lauder",
    headquarters: "New York",
    description:
      "Tom Ford Beauty brings the designer's signature vision of glamour, sensuality, and sophistication to fragrance, color cosmetics, and skincare. The Private Blend collection, featuring scents like Tobacco Vanille and Oud Wood, redefined luxury niche fragrance for a mainstream audience. Tom Ford Beauty represents unapologetic luxury and bold self-expression in the prestige beauty market.",
    hiring_profile:
      "Tom Ford Beauty seeks polished, glamour-savvy beauty professionals who embody the brand's standard of perfection and confidence. Candidates should bring prestige beauty expertise, strong visual standards, and the ability to communicate luxury with authority.",
    known_for: "Private Blend, Tobacco Vanille, Lip Color, Oud Wood, Glamorous beauty",
  },
  {
    slug: "la-mer",
    name: "La Mer",
    country: "United States",
    founded: 1965,
    sector: "Beauty & Fragrance",
    group: "Estée Lauder",
    headquarters: "New York",
    description:
      "La Mer was born from aerospace physicist Dr. Max Huber's quest to heal his scars using a miraculous broth of sea kelp, fermented through a bio-process he called the Miracle Broth. The Crème de la Mer has become the world's most coveted luxury moisturizer, with a devoted following among celebrities and skincare enthusiasts. La Mer represents the mythology and science of transformative luxury skincare.",
    hiring_profile:
      "La Mer seeks passionate, scientifically articulate beauty professionals who can convey the brand's unique origin story and product efficacy. Candidates should bring prestige skincare expertise, exceptional client service skills, and a genuine belief in the power of the Miracle Broth.",
    known_for: "Crème de la Mer, Miracle Broth, Sea kelp, Luxury moisturizer, Transformative skincare",
  },
  {
    slug: "valmont",
    name: "Valmont",
    country: "Switzerland",
    founded: 1985,
    sector: "Beauty & Fragrance",
    group: "Independent",
    headquarters: "Geneva",
    description:
      "Valmont draws on Swiss cellular cosmetics expertise and Alpine glacial spring water to create ultra-luxury skincare treatments favored by the world's top spas and beauty connoisseurs. The brand is also notable for its artistic collaborations, merging skincare with contemporary art through limited-edition collections. Valmont represents Swiss precision and artistic sensibility in prestige skincare.",
    hiring_profile:
      "Valmont seeks sophisticated, science-minded beauty professionals who appreciate the brand's Swiss heritage and artistic collaborations. Candidates should bring expertise in luxury spa or skincare retail, knowledge of cellular science, and an appreciation for art-beauty crossovers.",
    known_for: "Swiss cellular cosmetics, L'Elixir des Glaciers, Spa treatments, Art collaborations, Alpine water",
  },
  {
    slug: "augustinus-bader",
    name: "Augustinus Bader",
    country: "United Kingdom",
    founded: 2018,
    sector: "Beauty & Fragrance",
    group: "Independent",
    headquarters: "London",
    description:
      "Augustinus Bader was created by German biomedical scientist Professor Augustinus Bader, applying his decades of stem cell research and wound healing technology to luxury skincare. The Rich Cream rapidly became a cult product endorsed by Victoria Beckham and Kim Kardashian. The brand represents the cutting edge of science-backed luxury skincare, with formulations based on the patented TFC8 technology.",
    hiring_profile:
      "Augustinus Bader seeks scientifically literate, entrepreneurial beauty professionals who can articulate the brand's groundbreaking stem cell research to a luxury audience. Candidates should bring credibility in science communication, startup mentality, and prestige beauty experience.",
    known_for: "TFC8 technology, The Rich Cream, Stem cell research, Science-driven skincare, Celebrity following",
  },
  {
    slug: "111skin",
    name: "111Skin",
    country: "United Kingdom",
    founded: 2012,
    sector: "Beauty & Fragrance",
    group: "Independent",
    headquarters: "London",
    description:
      "111Skin was founded by Dr. Yannis Alexandrides, a renowned Harley Street plastic surgeon, who developed the NAC Y² formula to optimize skin healing after surgery. The brand's rose gold bio-cellulose masks and clinical-grade formulations have made it a favorite among celebrities and skincare professionals. 111Skin bridges the gap between clinical dermatology and luxury skincare indulgence.",
    hiring_profile:
      "111Skin seeks beauty professionals with clinical credibility and luxury positioning expertise who understand the brand's medical-grade approach. Candidates should bring knowledge of clinical skincare, Harley Street authority, and the ability to communicate scientific efficacy to luxury consumers.",
    known_for: "Rose gold masks, NAC Y² formula, Clinical luxury, Harley Street heritage, Post-procedure skincare",
  },
  {
    slug: "cle-de-peau-beaute",
    name: "Clé de Peau Beauté",
    country: "Japan",
    founded: 1982,
    sector: "Beauty & Fragrance",
    group: "Shiseido",
    headquarters: "Tokyo",
    description:
      "Clé de Peau Beauté, meaning 'Key to Skin Beauty,' represents the pinnacle of Shiseido's scientific research and Japanese luxury beauty craftsmanship. The brand's La Crème and Synactif lines feature some of the most advanced skincare formulations available, incorporating decades of Shiseido's skin science research. Clé de Peau Beauté embodies the Japanese philosophy of perfection through meticulous attention to every detail.",
    hiring_profile:
      "Clé de Peau Beauté seeks refined, science-oriented beauty professionals who appreciate Japanese precision and the pursuit of skincare perfection. Candidates should bring luxury beauty expertise, cultural sensitivity, and an understanding of Japanese aesthetics and innovation.",
    known_for: "La Crème, Japanese skincare science, Synactif, Shiseido research, Ultra-luxury beauty",
  },
  {
    slug: "guerlain",
    name: "Guerlain",
    country: "France",
    founded: 1828,
    sector: "Beauty & Fragrance",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Guerlain is one of the oldest and most prestigious perfume houses in the world, with master perfumers creating legendary scents like Shalimar, Mitsouko, and Jicky since 1828. The Maison is also celebrated for its skincare innovations, including the Orchidée Impériale line, and its iconic Météorites pearls. Guerlain represents nearly two centuries of French beauty excellence across fragrance, makeup, and skincare.",
    hiring_profile:
      "Guerlain seeks culturally sophisticated beauty professionals with deep appreciation for the art of French perfumery and the Maison's extraordinary heritage. Candidates should bring olfactory education, luxury client service expertise, and a passion for preserving and sharing Guerlain's legacy.",
    known_for: "Shalimar, Bee emblem, Orchidée Impériale, Météorites, French perfumery heritage",
  },
  {
    slug: "lancome",
    name: "Lancôme",
    country: "France",
    founded: 1935,
    sector: "Beauty & Fragrance",
    group: "L'Oréal",
    headquarters: "Paris",
    description:
      "Lancôme was founded by perfumer Armand Petitjean and has grown into one of the world's leading luxury beauty brands under L'Oréal's stewardship. The brand is known for its pioneering skincare innovations, including the Advanced Génifique serum, and its enduring partnership with iconic ambassadors. Lancôme represents accessible French luxury beauty with a strong emphasis on scientific innovation and feminine elegance.",
    hiring_profile:
      "Lancôme seeks dynamic, science-savvy beauty professionals who embody French elegance and can communicate skincare innovation to a global audience. Candidates should bring luxury beauty expertise, passion for empowering women, and an understanding of Lancôme's scientific and artistic heritage.",
    known_for: "Advanced Génifique, Rose emblem, La Vie Est Belle, French beauty, Skincare innovation",
  },
  {
    slug: "givenchy-beauty",
    name: "Givenchy Beauty",
    country: "France",
    founded: 1957,
    sector: "Beauty & Fragrance",
    group: "LVMH",
    headquarters: "Paris",
    description:
      "Givenchy Beauty was born from Hubert de Givenchy's collaboration with Audrey Hepburn, who inspired the iconic L'Interdit fragrance. The beauty line extends the house's couture codes of Parisian elegance and daring creativity into makeup, fragrance, and skincare. Givenchy Beauty combines couture-level artistry with bold, modern beauty innovation.",
    hiring_profile:
      "Givenchy Beauty seeks fashion-forward beauty professionals who understand the connection between couture and color cosmetics. Candidates should bring creative flair, luxury brand awareness, and an appreciation for the house's Parisian heritage and bold, modern identity.",
    known_for: "L'Interdit, Prisme Libre powder, Audrey Hepburn legacy, Couture beauty, Parisian elegance",
  },

  // ─────────────────────────────────────────────
  // SPIRITS, WINE & FINE DINING (15)
  // ─────────────────────────────────────────────
  {
    slug: "moet-et-chandon",
    name: "Moët & Chandon",
    country: "France",
    founded: 1743,
    sector: "Spirits & Dining",
    group: "LVMH",
    headquarters: "Épernay",
    description:
      "Moët & Chandon is the world's largest Champagne house, founded in Épernay and synonymous with celebration, glamour, and the art of living. The house supplies Champagne to royal courts and red carpets worldwide and is the official Champagne of Formula 1 podium ceremonies. Moët & Chandon has made Champagne accessible to a global audience while maintaining exceptional quality across its range.",
    hiring_profile:
      "Moët & Chandon seeks charismatic, celebration-minded professionals who embody the joyful spirit of Champagne and the art of entertaining. Candidates should bring wine knowledge, event expertise, and a natural talent for creating festive, memorable moments.",
    known_for: "Impérial Brut, Champagne celebrations, Épernay cellars, Formula 1, Global Champagne leader",
  },
  {
    slug: "dom-perignon",
    name: "Dom Pérignon",
    country: "France",
    founded: 1668,
    sector: "Spirits & Dining",
    group: "LVMH",
    headquarters: "Épernay",
    description:
      "Dom Pérignon is the prestige cuvée of Moët & Chandon, named after the Benedictine monk credited with pioneering Champagne production techniques. Every bottle is a vintage, only produced in exceptional years, and undergoes multiple plénitudes of aging that reveal new dimensions of complexity. Dom Pérignon represents the absolute pinnacle of Champagne as art, luxury, and collector's obsession.",
    hiring_profile:
      "Dom Pérignon seeks sophisticated, culturally attuned professionals who understand the intersection of fine wine, art, and luxury lifestyle. Candidates should bring deep wine knowledge, curatorial thinking, and the ability to engage ultra-high-net-worth collectors and tastemakers.",
    known_for: "Vintage only, Plénitude aging, Prestige Champagne, Creative collaborations, Collector's wine",
  },
  {
    slug: "krug",
    name: "Krug",
    country: "France",
    founded: 1843,
    sector: "Spirits & Dining",
    group: "LVMH",
    headquarters: "Reims",
    description:
      "Krug is considered by many connoisseurs to be the finest Champagne house, founded by Joseph Krug with the vision that Champagne is first and foremost a wine, not merely a celebratory drink. The house's distinctive approach involves aging reserve wines and blending across multiple vintages to create its legendary Grande Cuvée. Krug represents the most uncompromising, artisanal approach to Champagne production.",
    hiring_profile:
      "Krug seeks discerning, music-loving professionals who understand the house's philosophy of Champagne as a true wine to be savored. Candidates should bring sommelier-level wine knowledge, an appreciation for craftsmanship, and the ability to educate and inspire collectors.",
    known_for: "Grande Cuvée, Krug ID, Multi-vintage blending, Clos du Mesnil, Champagne-as-wine philosophy",
  },
  {
    slug: "louis-roederer",
    name: "Louis Roederer",
    country: "France",
    founded: 1776,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "Reims",
    description:
      "Louis Roederer is one of the last great independent, family-owned Champagne houses, renowned for creating Cristal in 1876 for Tsar Alexander II of Russia. The house owns an exceptional 240 hectares of vineyards and has pioneered biodynamic viticulture in Champagne. Louis Roederer represents the marriage of independent craftsmanship, royal heritage, and progressive winemaking philosophy.",
    hiring_profile:
      "Louis Roederer seeks wine-passionate, integrity-driven professionals who value independent ownership and estate-driven Champagne production. Candidates should bring deep wine knowledge, sustainability awareness, and respect for the house's family-owned, artisanal philosophy.",
    known_for: "Cristal, Family ownership, Biodynamic viticulture, Tsar Alexander II, Estate Champagne",
  },
  {
    slug: "petrus",
    name: "Petrus",
    country: "France",
    founded: 1837,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "Pomerol",
    description:
      "Pétrus is arguably the most legendary wine estate in Bordeaux, producing exclusively Merlot-based wine from a tiny vineyard of unique blue clay soil in Pomerol. The estate produces only around 30,000 bottles per vintage, making it one of the rarest and most expensive wines in the world. Pétrus represents the ultimate expression of terroir, where a specific patch of earth creates wine of incomparable richness and longevity.",
    hiring_profile:
      "Pétrus seeks oenological professionals with the deepest understanding of terroir-driven winemaking and the discipline to maintain perfection at the highest level. Candidates should bring exceptional viticulture expertise, patience, and absolute commitment to quality.",
    known_for: "Blue clay terroir, Merlot excellence, Pomerol, Extreme rarity, Auction record prices",
  },
  {
    slug: "chateau-lafite-rothschild",
    name: "Château Lafite Rothschild",
    country: "France",
    founded: 1234,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "Pauillac",
    description:
      "Château Lafite Rothschild is a Premier Grand Cru Classé estate in Pauillac, owned by the Rothschild family since 1868 and producing wines of extraordinary elegance and finesse. The estate's wines are prized for their remarkable aging potential, often reaching their peak after decades in the cellar. Lafite represents the aristocratic ideal of Bordeaux winemaking, where subtlety and breeding triumph over power.",
    hiring_profile:
      "Château Lafite Rothschild seeks dedicated oenological professionals with deep Bordeaux knowledge and reverence for the estate's centuries-long history. Candidates should bring expertise in viticulture, cellar management, or fine wine commerce alongside impeccable integrity.",
    known_for: "Premier Grand Cru Classé, Rothschild family, Pauillac elegance, Aging potential, Bordeaux aristocracy",
  },
  {
    slug: "hennessy",
    name: "Hennessy",
    country: "France",
    founded: 1765,
    sector: "Spirits & Dining",
    group: "LVMH",
    headquarters: "Cognac",
    description:
      "Hennessy is the world's largest Cognac house, founded by Irish officer Richard Hennessy and now selling over 50 million bottles annually across the globe. The house's master blenders have maintained an unbroken lineage for eight generations, drawing from a cellar of over 350,000 barrels. Hennessy has successfully positioned Cognac as a globally relevant luxury spirit, particularly in the United States and Asia.",
    hiring_profile:
      "Hennessy seeks globally minded, culturally fluent professionals who can connect Cognac's French heritage with diverse global audiences. Candidates should bring spirits expertise, cross-cultural communication skills, and the ability to operate within LVMH's high-performance culture.",
    known_for: "V.S.O.P, X.O, Paradis, Master blender lineage, Global Cognac leader",
  },
  {
    slug: "remy-martin",
    name: "Rémy Martin",
    country: "France",
    founded: 1724,
    sector: "Spirits & Dining",
    group: "Rémy Cointreau",
    headquarters: "Cognac",
    description:
      "Rémy Martin exclusively uses grapes from the Grande Champagne and Petite Champagne regions of Cognac, the two finest crus, making it the leading producer of Fine Champagne Cognac. The house's centaur logo and Louis XIII decanter, aged up to 100 years, represent the pinnacle of Cognac craftsmanship. Rémy Martin combines centuries of French terroir expertise with a commitment to sustainable viticulture.",
    hiring_profile:
      "Rémy Martin seeks terroir-conscious, heritage-driven spirits professionals who appreciate the exacting standards of Fine Champagne Cognac production. Candidates should bring deep spirits knowledge, sustainability commitment, and an understanding of luxury brand storytelling.",
    known_for: "Louis XIII, Fine Champagne Cognac, Centaur logo, X.O, Sustainable viticulture",
  },
  {
    slug: "the-macallan",
    name: "The Macallan",
    country: "United Kingdom",
    founded: 1824,
    sector: "Spirits & Dining",
    group: "Edrington",
    headquarters: "Craigellachie",
    description:
      "The Macallan is one of the world's most valuable and collected single malt Scotch whisky brands, renowned for its rich, sherry-cask-matured character and exceptional aged expressions. The distillery's spectacular new £140 million facility on the Easter Elchies estate is an architectural landmark. The Macallan has set numerous world records at auction and represents the pinnacle of single malt whisky as a luxury collectible.",
    hiring_profile:
      "The Macallan seeks passionate whisky professionals and luxury brand builders who understand the intersection of craft spirits and ultra-premium collectibility. Candidates should bring deep spirits knowledge, auction market awareness, and the ability to engage connoisseurs and collectors.",
    known_for: "Sherry oak casks, Fine & Rare collection, Easter Elchies estate, Auction records, Architecture",
  },
  {
    slug: "glenfiddich",
    name: "Glenfiddich",
    country: "United Kingdom",
    founded: 1887,
    sector: "Spirits & Dining",
    group: "William Grant & Sons",
    headquarters: "Dufftown",
    description:
      "Glenfiddich was the first single malt Scotch whisky to be actively promoted outside Scotland, effectively creating the global single malt category. The family-owned distillery, still run by descendants of founder William Grant, operates the industry's most iconic stag emblem and distinctive triangular bottle. Glenfiddich represents the pioneering spirit of independent Scottish whisky making.",
    hiring_profile:
      "Glenfiddich seeks adventurous, family-values-driven spirits professionals who respect the brand's pioneering heritage and independent ownership. Candidates should bring whisky knowledge, global brand-building expertise, and alignment with William Grant & Sons' long-term, family-owned vision.",
    known_for: "Stag emblem, Single malt pioneer, Family ownership, Triangular bottle, Experimental Series",
  },
  {
    slug: "beluga-vodka",
    name: "Beluga Vodka",
    country: "Russia",
    founded: 2002,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "Moscow",
    description:
      "Beluga is Russia's premier ultra-luxury vodka brand, produced in Siberia using pure artesian water and carefully selected malt spirit. The brand's production process includes a 30-day resting period between distillation stages, a practice unique in the vodka category. Beluga represents the finest expression of Russian vodka craftsmanship and has become a fixture of international luxury nightlife and fine dining.",
    hiring_profile:
      "Beluga seeks sophisticated, internationally minded spirits professionals who can position Russian vodka craftsmanship in the global luxury landscape. Candidates should bring spirits industry expertise, nightlife and hospitality connections, and the ability to convey artisanal quality.",
    known_for: "Siberian production, Artesian water, 30-day resting process, Noble Russian vodka, Ultra-premium positioning",
  },
  {
    slug: "nobu-restaurants",
    name: "Nobu Restaurants",
    country: "United States",
    founded: 1994,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "New York",
    description:
      "Nobu Matsuhisa's eponymous restaurant revolutionized global dining by fusing Japanese cuisine with Peruvian and Argentine influences, creating an entirely new culinary language. Co-founded with Robert De Niro, Nobu has expanded into a global empire of restaurants and hotels that define celebrity dining culture. Nobu represents the intersection of culinary innovation, celebrity, and luxury hospitality on a global scale.",
    hiring_profile:
      "Nobu seeks globally minded, hospitality-driven culinary professionals who thrive in high-energy, celebrity-frequented environments. Candidates should bring Japanese culinary knowledge or luxury hospitality expertise, cultural sensitivity, and the ability to deliver consistent excellence across a global brand.",
    known_for: "Japanese-Peruvian fusion, Black Cod Miso, Celebrity clientele, Global expansion, Omakase",
  },
  {
    slug: "alain-ducasse",
    name: "Alain Ducasse",
    country: "France",
    founded: 1987,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Alain Ducasse is the most decorated chef in the world, the first to hold three Michelin stars simultaneously at three different restaurants. His empire spans fine dining, bistros, culinary schools, and chocolate manufacturing, all unified by a philosophy of ingredient-driven, naturalistic French cuisine. Ducasse represents the pinnacle of French culinary excellence and entrepreneurial ambition in gastronomy.",
    hiring_profile:
      "Alain Ducasse enterprises seek disciplined, ingredient-obsessed culinary professionals who share the chef's philosophy of naturality and respect for terroir. Candidates should bring classical French technique, entrepreneurial spirit, and the drive to achieve and maintain the highest culinary standards.",
    known_for: "Multiple three-star restaurants, Naturalité philosophy, Culinary empire, Chocolate manufacturing, French gastronomy",
  },
  {
    slug: "pierre-gagnaire",
    name: "Pierre Gagnaire",
    country: "France",
    founded: 1981,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Pierre Gagnaire is one of the most creative and intellectually daring chefs in the world, known for his improvisational, multi-element dishes that blur the line between cuisine and art. His collaboration with molecular gastronomist Hervé This has pushed the boundaries of culinary science. Gagnaire represents the avant-garde of French haute cuisine, where emotion, intuition, and scientific curiosity converge.",
    hiring_profile:
      "Pierre Gagnaire seeks creatively fearless, intellectually curious culinary professionals who embrace improvisation and scientific exploration in cooking. Candidates should bring exceptional classical technique, artistic sensibility, and openness to experimental approaches.",
    known_for: "Avant-garde cuisine, Molecular gastronomy collaboration, Improvisation, Multi-element dishes, Artistic plating",
  },
  {
    slug: "le-bernardin",
    name: "Le Bernardin",
    country: "United States",
    founded: 1972,
    sector: "Spirits & Dining",
    group: "Independent",
    headquarters: "New York",
    description:
      "Le Bernardin is widely considered the finest seafood restaurant in the world, maintaining three Michelin stars and a four-star New York Times rating for decades under chef Éric Ripert. Founded by siblings Gilbert and Maguy Le Coze in Paris and moved to New York in 1986, the restaurant elevates seafood to the highest level of culinary art. Le Bernardin represents the ultimate expression of simplicity, technique, and respect for marine ingredients.",
    hiring_profile:
      "Le Bernardin seeks disciplined, seafood-passionate culinary professionals who share Éric Ripert's philosophy of simplicity, respect for ingredients, and mindful cooking. Candidates should bring exceptional technique, humility, and the dedication required to maintain the highest standards in fine dining.",
    known_for: "Three Michelin stars, Seafood excellence, Éric Ripert, Barely cooked philosophy, New York fine dining",
  },

  // ─────────────────────────────────────────────
  // PRIVATE AVIATION & YACHTING (8)
  // ─────────────────────────────────────────────
  {
    slug: "netjets",
    name: "NetJets",
    country: "United States",
    founded: 1964,
    sector: "Aviation & Yachting",
    group: "Berkshire Hathaway",
    headquarters: "Columbus",
    description:
      "NetJets invented the concept of fractional aircraft ownership, allowing individuals and corporations to own shares of private jets with guaranteed availability. As a Berkshire Hathaway subsidiary endorsed by Warren Buffett himself, NetJets operates the world's largest private jet fleet. NetJets represents the gold standard of private aviation, combining safety, reliability, and flexibility for the world's most discerning travelers.",
    hiring_profile:
      "NetJets seeks safety-obsessed, service-driven aviation professionals who understand that private aviation clients demand perfection. Candidates should bring exceptional reliability, discretion, and a commitment to the highest safety and service standards in the industry.",
    known_for: "Fractional ownership, Largest private jet fleet, Berkshire Hathaway, Warren Buffett, Safety record",
  },
  {
    slug: "vistajet",
    name: "VistaJet",
    country: "Malta",
    founded: 2004,
    sector: "Aviation & Yachting",
    group: "Independent",
    headquarters: "Malta",
    description:
      "VistaJet disrupted private aviation by offering a subscription-based model where clients pay for flight hours without the complexity of aircraft ownership. The fleet of silver and red Bombardier Global and Challenger jets is instantly recognizable and operates on a global scale. VistaJet represents the modern, asset-light approach to ultra-luxury private aviation.",
    hiring_profile:
      "VistaJet seeks globally mobile, entrepreneurial aviation professionals who embrace the brand's innovative subscription model. Candidates should bring luxury service experience, multilingual abilities, and comfort operating across diverse cultures and time zones.",
    known_for: "Silver and red livery, Subscription model, Global fleet, Bombardier jets, Asset-light aviation",
  },
  {
    slug: "wheels-up",
    name: "Wheels Up",
    country: "United States",
    founded: 2013,
    sector: "Aviation & Yachting",
    group: "Independent",
    headquarters: "New York",
    description:
      "Wheels Up democratized private aviation by creating a membership-based platform that makes private flying more accessible through shared flights and guaranteed availability. The brand has grown rapidly through its technology platform, fleet partnerships, and strong brand recognition. Wheels Up represents the evolution of private aviation toward a more accessible, digitally enabled membership model.",
    hiring_profile:
      "Wheels Up seeks tech-savvy, membership-minded aviation and hospitality professionals who can deliver premium experiences at scale. Candidates should bring entrepreneurial energy, digital platform expertise, and the ability to serve a growing community of private aviation members.",
    known_for: "Membership model, Accessible private aviation, Technology platform, Fleet network, King Air fleet",
  },
  {
    slug: "dassault-aviation",
    name: "Dassault Aviation",
    country: "France",
    founded: 1929,
    sector: "Aviation & Yachting",
    group: "Dassault Group",
    headquarters: "Paris",
    description:
      "Dassault Aviation is France's premier aerospace manufacturer, producing the Falcon line of business jets alongside the Rafale military fighter. The Falcon jets are renowned for their aerodynamic innovation, tri-jet configurations, and exceptional short-field performance. Dassault represents French aerospace excellence and engineering sophistication in both military and civilian aviation.",
    hiring_profile:
      "Dassault Aviation seeks exceptional aerospace engineers and professionals who bring French engineering rigor and innovation to the world of business aviation. Candidates should demonstrate technical excellence, attention to aerodynamic performance, and pride in French aerospace heritage.",
    known_for: "Falcon jets, Tri-jet design, French aerospace, Rafale fighter, Aerodynamic innovation",
  },
  {
    slug: "lurssen-yachts",
    name: "Lürssen Yachts",
    country: "Germany",
    founded: 1875,
    sector: "Aviation & Yachting",
    group: "Independent",
    headquarters: "Bremen",
    description:
      "Lürssen is the world's premier builder of custom superyachts and megayachts, having constructed some of the largest and most complex private vessels ever built. The Bremen-based shipyard combines German engineering precision with bespoke luxury customization for the world's wealthiest yacht owners. Lürssen represents the absolute pinnacle of superyacht construction, where no project is too ambitious.",
    hiring_profile:
      "Lürssen seeks world-class naval architects, marine engineers, and luxury craftspeople who can execute projects of unprecedented scale and complexity. Candidates should bring exceptional technical skills, patience for multi-year projects, and comfort working with ultra-high-net-worth clients.",
    known_for: "Custom megayachts, German engineering, Azzam, Project scale, Bespoke construction",
  },
  {
    slug: "feadship",
    name: "Feadship",
    country: "Netherlands",
    founded: 1949,
    sector: "Aviation & Yachting",
    group: "Independent",
    headquarters: "Haarlem",
    description:
      "Feadship is a Dutch collaborative of two shipyards and a design studio that has set the global benchmark for custom superyacht quality and innovation. Every Feadship is entirely custom-built, with no two vessels alike, reflecting the client's vision brought to life by Dutch craftsmanship. Feadship represents the finest tradition of Dutch maritime engineering applied to the ultimate personal luxury.",
    hiring_profile:
      "Feadship seeks innovative naval architects, designers, and craftspeople who embrace the challenge of creating entirely bespoke vessels from a blank sheet of paper. Candidates should bring exceptional technical skills, Dutch pragmatism, and a passion for maritime innovation.",
    known_for: "Fully custom yachts, Dutch craftsmanship, Innovation, Pure custom philosophy, Collaborative model",
  },
  {
    slug: "benetti",
    name: "Benetti",
    country: "Italy",
    founded: 1873,
    sector: "Aviation & Yachting",
    group: "Azimut-Benetti",
    headquarters: "Viareggio",
    description:
      "Benetti is Italy's oldest and most prestigious shipyard, building luxury yachts from its Viareggio base since 1873. The yard is renowned for its composite and steel megayachts that blend Italian design flair with engineering excellence. Benetti has delivered some of the most iconic Italian superyachts, combining la bella vita aesthetics with seaworthy performance.",
    hiring_profile:
      "Benetti seeks skilled Italian craftspeople and maritime professionals who bring passion for yacht design and Italy's boatbuilding heritage. Candidates should demonstrate expertise in luxury vessel construction, Italian design sensibility, and pride in Viareggio's shipbuilding tradition.",
    known_for: "Italian megayachts, Viareggio heritage, Custom builds, Mediterranean style, Oldest Italian shipyard",
  },
  {
    slug: "azimut-benetti",
    name: "Azimut-Benetti",
    country: "Italy",
    founded: 1969,
    sector: "Aviation & Yachting",
    group: "Independent",
    headquarters: "Turin",
    description:
      "Azimut-Benetti is the world's largest privately owned luxury yacht group, encompassing the Azimut and Benetti brands alongside other marques. The group leads the global market in production yacht volume while maintaining Italian design excellence and build quality. Azimut-Benetti represents the scale and ambition of Italian maritime luxury at its most globally successful.",
    hiring_profile:
      "Azimut-Benetti seeks commercially driven, design-aware professionals who can operate within the world's largest luxury yacht group. Candidates should bring industry knowledge, Italian design appreciation, and the ability to serve an international clientele of yacht owners.",
    known_for: "Largest yacht group, Azimut sport yachts, Italian design, Global market leader, Production excellence",
  },

  // ─────────────────────────────────────────────
  // ART, CULTURE & COLLECTIBLES (10)
  // ─────────────────────────────────────────────
  {
    slug: "christies",
    name: "Christie's",
    country: "United Kingdom",
    founded: 1766,
    sector: "Art & Culture",
    group: "Artémis",
    headquarters: "London",
    description:
      "Christie's is the world's leading auction house, founded by James Christie and responsible for some of the most significant art sales in history, including Leonardo da Vinci's Salvator Mundi for $450 million. The house operates across all major collecting categories from fine art and jewellery to wine, watches, and luxury goods. Christie's represents the pinnacle of the global art market and the trusted arbiter of cultural value.",
    hiring_profile:
      "Christie's seeks intellectually curious, culturally fluent professionals with expertise in art history, valuation, or luxury market dynamics. Candidates should bring scholarly rigor, client relationship skills, and a passion for connecting collectors with exceptional works.",
    known_for: "Salvator Mundi sale, Art auctions, Global market leader, Pinault ownership, Cultural authority",
  },
  {
    slug: "sothebys",
    name: "Sotheby's",
    country: "United States",
    founded: 1744,
    sector: "Art & Culture",
    group: "BidFair",
    headquarters: "New York",
    description:
      "Sotheby's is the world's oldest international auction house, founded in London in 1744 and now headquartered in New York. The house has pioneered innovations in the auction world including online bidding, private sales, and financial services for collectors. Sotheby's represents centuries of trust, connoisseurship, and market-making in the global art and luxury collectibles market.",
    hiring_profile:
      "Sotheby's seeks market-savvy, culturally sophisticated professionals who combine art world knowledge with commercial acumen and digital fluency. Candidates should bring expertise in collecting categories, client advisory skills, and an entrepreneurial approach to the evolving auction business.",
    known_for: "Oldest auction house, Art market innovation, Online auctions, Private sales, Patrick Drahi ownership",
  },
  {
    slug: "phillips",
    name: "Phillips Auction",
    country: "United Kingdom",
    founded: 1796,
    sector: "Art & Culture",
    group: "Mercury Group",
    headquarters: "London",
    description:
      "Phillips has positioned itself as the auction house for the 20th and 21st centuries, specializing in contemporary art, design, photography, and watches. The house has carved a distinctive niche by focusing on emerging and mid-career artists and the hottest segments of the collecting market. Phillips represents the progressive, forward-looking end of the auction world with a younger, design-conscious clientele.",
    hiring_profile:
      "Phillips seeks contemporary-minded, trend-aware professionals who are passionate about 20th and 21st century art, design, and collecting culture. Candidates should bring market knowledge, digital savviness, and the ability to engage a younger generation of collectors.",
    known_for: "Contemporary art focus, Watch auctions, 20th-century design, Emerging artists, Progressive positioning",
  },
  {
    slug: "gagosian",
    name: "Gagosian Gallery",
    country: "United States",
    founded: 1980,
    sector: "Art & Culture",
    group: "Independent",
    headquarters: "New York",
    description:
      "Gagosian is the world's most powerful commercial gallery, operating 19 locations across the globe and representing the most important living artists and major estates. Larry Gagosian built an unprecedented art dealing empire that has shaped the contemporary art market and set records across multiple categories. Gagosian represents the highest level of commercial gallery activity, where art, commerce, and cultural influence converge.",
    hiring_profile:
      "Gagosian seeks ambitious, deeply knowledgeable art world professionals who can operate at the intersection of culture, commerce, and high-net-worth client relationships. Candidates should bring art historical expertise, sales acumen, and the drive to thrive in the world's most competitive gallery environment.",
    known_for: "Global gallery empire, Blue-chip artists, Market influence, Larry Gagosian, 19 locations",
  },
  {
    slug: "hauser-wirth",
    name: "Hauser & Wirth",
    country: "Switzerland",
    founded: 1992,
    sector: "Art & Culture",
    group: "Independent",
    headquarters: "Zurich",
    description:
      "Hauser & Wirth has grown from a Zurich gallery into one of the world's most influential mega-galleries, known for its commitment to art historical depth, artist estates, and ambitious non-urban exhibition spaces. The gallery's Somerset outpost, set in a converted farm, redefined the destination gallery concept. Hauser & Wirth represents the intellectual, community-minded model of the global mega-gallery.",
    hiring_profile:
      "Hauser & Wirth seeks intellectually engaged, community-oriented art professionals who value long-term artist relationships and art historical scholarship. Candidates should bring curatorial depth, a passion for education and public programming, and alignment with the gallery's values-driven approach.",
    known_for: "Somerset gallery, Artist estates, Art historical depth, Global expansion, Community engagement",
  },
  {
    slug: "pace-gallery",
    name: "Pace Gallery",
    country: "United States",
    founded: 1960,
    sector: "Art & Culture",
    group: "Independent",
    headquarters: "New York",
    description:
      "Pace Gallery is one of the world's leading contemporary art galleries, founded by Arne Glimcher and representing a roster of blue-chip artists spanning Abstract Expressionism to digital art. The gallery's flagship on 540 West 25th Street in Chelsea is one of the largest commercial gallery spaces in the world. Pace has been a pioneer in artist-driven technology and new media art through its Pace Verso initiative.",
    hiring_profile:
      "Pace Gallery seeks forward-thinking art professionals who appreciate the gallery's range from post-war masters to cutting-edge digital and new media art. Candidates should bring art market expertise, technology fluency, and the vision to advance the gallery's progressive, artist-first philosophy.",
    known_for: "Blue-chip contemporary art, Chelsea flagship, Technology in art, Pace Verso, Artist-first philosophy",
  },
  {
    slug: "art-basel",
    name: "Art Basel",
    country: "Switzerland",
    founded: 1970,
    sector: "Art & Culture",
    group: "MCH Group",
    headquarters: "Basel",
    description:
      "Art Basel is the world's premier art fair, operating annual editions in Basel, Miami Beach, Paris, and Hong Kong that serve as the central meeting points of the global art market. The fair has transformed from a regional art event into the definitive platform where galleries, collectors, curators, and institutions converge. Art Basel represents the epicenter of the international art world's commercial and cultural activity.",
    hiring_profile:
      "Art Basel seeks globally connected, culturally sophisticated professionals who can orchestrate world-class art fair experiences across multiple continents. Candidates should bring deep art market knowledge, event management expertise, and the diplomatic skills to serve galleries, collectors, and institutions simultaneously.",
    known_for: "Global art fairs, Basel-Miami-Paris-Hong Kong, Art market epicenter, VIP programming, Cultural events",
  },
  {
    slug: "frieze",
    name: "Frieze",
    country: "United Kingdom",
    founded: 2003,
    sector: "Art & Culture",
    group: "Independent",
    headquarters: "London",
    description:
      "Frieze began as a contemporary art magazine and expanded into a major art fair franchise operating in London, New York, Los Angeles, and Seoul. The fairs are known for their focus on contemporary and emerging art, curated sections, and strong programming that bridges commercial art and critical discourse. Frieze represents the younger, more progressive end of the international art fair circuit.",
    hiring_profile:
      "Frieze seeks culturally engaged, editorially minded professionals who understand the intersection of art criticism, curation, and commercial art fairs. Candidates should bring contemporary art knowledge, media expertise, and the ability to create compelling cultural programming.",
    known_for: "Contemporary art fairs, Frieze magazine, Curated sections, London-New York-LA-Seoul, Progressive programming",
  },
  {
    slug: "bonhams",
    name: "Bonhams",
    country: "United Kingdom",
    founded: 1793,
    sector: "Art & Culture",
    group: "Independent",
    headquarters: "London",
    description:
      "Bonhams is one of the world's oldest and largest auctioneers, known for its expertise in specialist categories including motor cars, Asian art, whisky, and scientific instruments. The privately owned house operates from historic premises on New Bond Street and maintains a strong presence in collector-driven niches. Bonhams represents the specialist, connoisseur-driven tradition of the British auction world.",
    hiring_profile:
      "Bonhams seeks specialist, deeply knowledgeable professionals with passion for niche collecting categories and traditional auction expertise. Candidates should bring category-specific knowledge, client relationship skills, and an appreciation for the specialist auction tradition.",
    known_for: "Motor car auctions, Specialist categories, New Bond Street, Whisky auctions, Asian art",
  },
  {
    slug: "artcurial",
    name: "Artcurial",
    country: "France",
    founded: 2002,
    sector: "Art & Culture",
    group: "Independent",
    headquarters: "Paris",
    description:
      "Artcurial is France's leading auction house, headquartered in the historic Hôtel Marcel Dassault on the Champs-Élysées. The house is renowned for its expertise in motor cars, comic art (bandes dessinées), Hergé works, and French decorative arts. Artcurial represents the distinctly French auction tradition, with particular strength in Gallic cultural categories and collector car sales.",
    hiring_profile:
      "Artcurial seeks cultured, French-market-savvy professionals with expertise in the auction house's signature categories and Parisian art world. Candidates should bring specialist knowledge, French cultural fluency, and commercial skills suited to France's leading independent auction house.",
    known_for: "Rétromobile motor car sales, Hergé/Tintin auctions, Champs-Élysées location, French art market leader, Bandes dessinées",
  },
]
