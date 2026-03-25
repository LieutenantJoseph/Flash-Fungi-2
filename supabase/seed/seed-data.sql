-- Flash Fungi v2.0 — Seed Data
-- Run in Supabase SQL Editor AFTER 001_initial_schema.sql
-- Uses service role connection (bypasses RLS) to insert test data.

-- ============================================================
-- SPECIMENS (10 Arizona mushroom species)
-- ============================================================
INSERT INTO specimens (species_name, genus, family, common_name, inaturalist_id, location, description, dna_sequenced, status, quality_score) VALUES
  ('Amanita muscaria', 'Amanita', 'Amanitaceae', 'Fly Agaric', 'seed-001', 'Flagstaff, Arizona', 'Classic red cap with white warts. Found under ponderosa pine.', false, 'approved', 85),
  ('Boletus edulis', 'Boletus', 'Boletaceae', 'King Bolete', 'seed-002', 'Kaibab National Forest, Arizona', 'Large brown cap with white pore surface. Thick bulbous stem.', true, 'approved', 92),
  ('Agaricus campestris', 'Agaricus', 'Agaricaceae', 'Field Mushroom', 'seed-003', 'Prescott, Arizona', 'White cap, pink gills darkening to brown. Found in grasslands.', false, 'approved', 78),
  ('Ganoderma applanatum', 'Ganoderma', 'Polyporaceae', 'Artist Conk', 'seed-004', 'Oak Creek Canyon, Arizona', 'Large woody bracket fungus. Brown upper surface, white pore surface that bruises brown.', false, 'approved', 80),
  ('Lycoperdon perlatum', 'Lycoperdon', 'Agaricaceae', 'Gem-Studded Puffball', 'seed-005', 'Mount Lemmon, Arizona', 'Small white puffball covered in tiny spines. Edible when young and white inside.', false, 'approved', 75),
  ('Pleurotus ostreatus', 'Pleurotus', 'Pleurotaceae', 'Oyster Mushroom', 'seed-006', 'Sedona, Arizona', 'Fan-shaped, growing in overlapping clusters on dead hardwood.', true, 'approved', 90),
  ('Coprinus comatus', 'Coprinus', 'Agaricaceae', 'Shaggy Mane', 'seed-007', 'Tucson, Arizona', 'Tall cylindrical cap with shaggy scales. Deliquesces into black ink.', false, 'approved', 82),
  ('Trametes versicolor', 'Trametes', 'Polyporaceae', 'Turkey Tail', 'seed-008', 'Payson, Arizona', 'Thin leathery brackets with concentric color zones. Very common on dead wood.', false, 'approved', 88),
  ('Morchella esculenta', 'Morchella', 'Morchellaceae', 'Yellow Morel', 'seed-009', 'White Mountains, Arizona', 'Distinctive honeycomb-patterned cap. Highly prized edible.', true, 'approved', 95),
  ('Chlorophyllum molybdites', 'Chlorophyllum', 'Agaricaceae', 'Green-Spored Parasol', 'seed-010', 'Phoenix, Arizona', 'Large white mushroom with greenish spore print. Common lawn mushroom. POISONOUS.', false, 'approved', 85),
  -- A few pending specimens for admin testing
  ('Russula emetica', 'Russula', 'Russulaceae', 'The Sickener', 'seed-011', 'Flagstaff, Arizona', 'Bright red cap, white stem. Acrid taste.', false, 'pending', 70),
  ('Suillus brevipes', 'Suillus', 'Suillaceae', 'Short-Stalked Slippery Jack', 'seed-012', 'Kaibab National Forest, Arizona', 'Slimy brown cap with spongy pore surface.', false, 'pending', 65)
ON CONFLICT (inaturalist_id) DO NOTHING;

-- ============================================================
-- SPECIMEN PHOTOS (3 photos each for approved specimens)
-- ============================================================
INSERT INTO specimen_photos (specimen_id, inaturalist_photo_id, url, attribution, license, position)
SELECT
  s.id,
  'seed-photo-' || s.inaturalist_id || '-' || n.pos,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/placeholder/medium.jpg',
  'Seed data — replace with real iNaturalist photos',
  'CC-BY',
  n.pos
FROM specimens s
CROSS JOIN (VALUES (0), (1), (2)) AS n(pos)
WHERE s.inaturalist_id LIKE 'seed-%'
  AND s.status = 'approved'
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIELD GUIDES (published guides for approved species)
-- ============================================================
INSERT INTO field_guides (species_name, common_name, genus, family, description, ecology, hints, diagnostic_features, status) VALUES
(
  'Amanita muscaria', 'Fly Agaric', 'Amanita', 'Amanitaceae',
  'One of the most recognizable mushrooms in the world. The bright red cap with white wart-like patches is iconic in folklore and art. While visually striking, it contains ibotenic acid and muscimol.',
  'Mycorrhizal with conifers and birch. Common in montane forests of Arizona above 7000 feet. Fruits in late summer through fall after monsoon rains.',
  '[{"type":"morphological","level":1,"text":"Look for a bright red to orange cap with white to yellowish wart-like patches (remnants of the universal veil).","educational_value":"high"},{"type":"comparative","level":2,"text":"Distinguished from Amanita flavoconia by the red (not yellow-orange) cap and white (not yellow) warts.","educational_value":"high"},{"type":"ecological","level":3,"text":"Almost always found under conifers or birch. In Arizona, look under Ponderosa pine and spruce at higher elevations.","educational_value":"medium"},{"type":"taxonomic","level":4,"text":"Member of section Amanita within genus Amanita. The universal veil breaks into distinctive warts rather than a volval cup.","educational_value":"medium"}]'::JSONB,
  '{"cap":{"shape":"Convex becoming flat","color":"Bright red to orange-red","texture":"Smooth with white wart patches","size_range":"8-20 cm"},"gills_pores":{"type":"Gills","attachment":"Free","spacing":"Close","color":"White"},"stem":{"ring_presence":"Skirt-like ring","base_structure":"Bulbous with concentric rings of universal veil","texture":"White, smooth to slightly scaly"},"spore_print":{"color":"White","collection_method":"Place cap on paper overnight"},"chemical_reactions":{"tests":[]}}'::JSONB,
  'published'
),
(
  'Boletus edulis', 'King Bolete', 'Boletus', 'Boletaceae',
  'The king of edible mushrooms. Prized worldwide for its rich, nutty flavor. Large, meaty cap with a spongy pore surface underneath instead of gills.',
  'Mycorrhizal with conifers, especially spruce and pine. Found in montane forests of northern Arizona. Fruits during and after monsoon rains in summer.',
  '[{"type":"morphological","level":1,"text":"Large brown cap (10-30cm) with a thick, bulbous white stem featuring fine net-like reticulation near the top.","educational_value":"high"},{"type":"comparative","level":2,"text":"Unlike bitter Tylopilus felleus, the pore surface stays white to olive-yellow (never pink) and the stem reticulation is finer.","educational_value":"high"},{"type":"ecological","level":3,"text":"Strongly mycorrhizal with spruce and pine. In Arizona, search under Engelmann spruce above 8000 feet.","educational_value":"medium"},{"type":"taxonomic","level":4,"text":"Boletus sensu stricto. Distinguished by white reticulum on stipe, non-bluing flesh, and olive-brown spore print.","educational_value":"medium"}]'::JSONB,
  '{"cap":{"shape":"Convex, bun-shaped","color":"Brown to reddish-brown","texture":"Smooth, slightly tacky when wet","size_range":"10-30 cm"},"gills_pores":{"type":"Pores","attachment":"Depressed around stem","spacing":"Fine, round","color":"White aging to olive-yellow"},"stem":{"ring_presence":"None","base_structure":"Bulbous, clavate","texture":"White with fine brown reticulation"},"spore_print":{"color":"Olive-brown","collection_method":"Place cap pore-side down on paper"},"chemical_reactions":{"tests":["No bluing reaction when cut"]}}'::JSONB,
  'published'
),
(
  'Pleurotus ostreatus', 'Oyster Mushroom', 'Pleurotus', 'Pleurotaceae',
  'A popular edible mushroom found growing on dead or dying hardwood trees. Fan-shaped caps grow in overlapping shelf-like clusters. Excellent for beginners to identify.',
  'Saprotrophic on dead hardwood, occasionally on conifers. One of the few mushrooms that can be found year-round in mild climates. Also a carnivorous fungus that traps nematodes.',
  '[{"type":"morphological","level":1,"text":"Fan or oyster-shaped caps (5-25cm) growing in overlapping clusters. Gills run down the short, off-center stem.","educational_value":"high"},{"type":"comparative","level":2,"text":"Angel wings (Pleurocybella porrigens) are thinner, pure white, and grow on conifer wood. Oyster mushrooms are fleshier and prefer hardwood.","educational_value":"high"},{"type":"ecological","level":3,"text":"Look on dead or dying hardwood — cottonwood, oak, and elm are favorites. Can fruit from fall through spring in Arizona low elevations.","educational_value":"medium"},{"type":"taxonomic","level":4,"text":"Pleurotus means side-ear, referring to the lateral stem attachment. White spore print distinguishes from similar look-alikes.","educational_value":"medium"}]'::JSONB,
  '{"cap":{"shape":"Fan-shaped, convex to flat","color":"White to gray to tan","texture":"Smooth","size_range":"5-25 cm"},"gills_pores":{"type":"Gills","attachment":"Decurrent (running down stem)","spacing":"Close to crowded","color":"White to cream"},"stem":{"ring_presence":"None","base_structure":"Short, lateral or absent","texture":"White, smooth to hairy at base"},"spore_print":{"color":"White to lilac-gray","collection_method":"Place cap gill-side down on dark paper"},"chemical_reactions":{"tests":[]}}'::JSONB,
  'published'
),
(
  'Morchella esculenta', 'Yellow Morel', 'Morchella', 'Morchellaceae',
  'One of the most sought-after edible mushrooms. The distinctive honeycomb-patterned cap is unmistakable. Highly prized by chefs for its earthy, nutty flavor.',
  'Saprotrophic and possibly mycorrhizal. Often found in disturbed areas, old orchards, and burned forests. In Arizona, found at higher elevations in spring, especially after forest fires.',
  '[{"type":"morphological","level":1,"text":"Honeycomb-patterned cap with ridges and pits, attached directly to the stem at the base. Entirely hollow when sliced lengthwise.","educational_value":"high"},{"type":"comparative","level":2,"text":"CRITICAL: True morels are completely hollow inside. False morels (Gyromitra) have brain-like wrinkles (not pits) and are NOT hollow — they have chambered or cottony interior.","educational_value":"high"},{"type":"ecological","level":3,"text":"In Arizona, search at 7000+ feet in spring, especially in areas burned the previous year. Look around dying elms, old apple orchards, and cottonwood bottoms.","educational_value":"medium"},{"type":"taxonomic","level":4,"text":"Morchella is an ascomycete (spores in sacs), not a basidiomycete like most gilled mushrooms. Recent DNA work has split this into many cryptic species.","educational_value":"medium"}]'::JSONB,
  '{"cap":{"shape":"Conical to egg-shaped","color":"Yellow-brown to tan","texture":"Honeycomb pattern of ridges and pits","size_range":"4-12 cm tall"},"gills_pores":{"type":"None — pitted and ridged surface","attachment":"Cap attached at base of stem","spacing":"N/A","color":"Tan to dark brown ridges"},"stem":{"ring_presence":"None","base_structure":"Enlarged at base","texture":"White to cream, granular"},"spore_print":{"color":"Cream to yellow","collection_method":"Difficult — place cap on paper in humid container"},"chemical_reactions":{"tests":[]}}'::JSONB,
  'published'
)
ON CONFLICT (species_name) DO NOTHING;

-- ============================================================
-- TRAINING MODULES (2 starter modules)
-- ============================================================
INSERT INTO training_modules (id, title, icon, category, difficulty_level, duration_minutes, content, published) VALUES
(
  'intro-to-mycology',
  'Introduction to Mycology',
  '🍄',
  'Fundamentals',
  'beginner',
  15,
  '{
    "introduction": {
      "pages": [
        {
          "title": "What Are Fungi?",
          "content": "Fungi are a kingdom of organisms separate from plants and animals. They include mushrooms, molds, yeasts, and more. Unlike plants, fungi cannot photosynthesize — they obtain nutrients by breaking down organic matter or forming partnerships with living plants.",
          "image": "🍄"
        },
        {
          "title": "Why Study Mycology?",
          "content": "Mushrooms play critical roles in ecosystems as decomposers, symbionts, and food sources. Learning to identify them opens up a world of ecology, cuisine, medicine, and forest health. But identification skills are essential — some species are deadly.",
          "image": "🔬"
        },
        {
          "title": "The Three Rules of Mushroom Identification",
          "content": "1. NEVER eat a wild mushroom unless you are 100% certain of its identity.\n2. Use MULTIPLE identification features — cap, gills, stem, spore print, habitat, and season.\n3. When in doubt, throw it out. No meal is worth the risk.",
          "image": "⚠️"
        }
      ]
    },
    "quiz": {
      "questions": [
        {
          "question": "Fungi are most closely related to which kingdom?",
          "options": ["Plants", "Animals", "Bacteria", "Protists"],
          "correct": 1,
          "explanation": "Molecular studies show fungi are more closely related to animals than to plants. Both fungi and animals are heterotrophs in the clade Opisthokonta."
        },
        {
          "question": "What is the primary way fungi obtain nutrients?",
          "options": ["Photosynthesis", "Absorption from organic matter", "Hunting prey", "Chemosynthesis"],
          "correct": 1,
          "explanation": "Fungi secrete enzymes to break down organic matter externally, then absorb the resulting nutrients. This makes them essential decomposers."
        },
        {
          "question": "Which is NOT one of the three rules of mushroom identification?",
          "options": ["Never eat unless 100% certain", "Use multiple features", "Taste-test small amounts first", "When in doubt, throw it out"],
          "correct": 2,
          "explanation": "NEVER taste-test unknown mushrooms. Some deadly species like Amanita phalloides have a pleasant taste but can cause fatal liver failure."
        }
      ]
    }
  }'::JSONB,
  true
),
(
  'cap-and-gill-anatomy',
  'Cap & Gill Anatomy',
  '🔬',
  'Fundamentals',
  'beginner',
  20,
  '{
    "introduction": {
      "pages": [
        {
          "title": "Cap Shapes",
          "content": "The cap (pileus) is often the first thing you notice. Common shapes include: convex (rounded), flat (planar), umbonate (with a central bump), depressed (sunken center), and conical (pointed). Cap shape often changes as the mushroom matures.",
          "image": "🧢"
        },
        {
          "title": "Gill Attachment",
          "content": "How gills attach to the stem is a key identification feature. Free gills do not touch the stem. Adnate gills attach squarely. Decurrent gills run down the stem. Sinuate gills curve upward before attaching. This single feature can narrow your identification significantly.",
          "image": "📐"
        },
        {
          "title": "Spore Prints",
          "content": "A spore print reveals the color of a mushroom''s spores — invisible to the naked eye on the gills but visible en masse on paper. To make one: remove the stem, place the cap gill-side down on white and dark paper, cover with a bowl, and wait 4-12 hours.",
          "image": "📝"
        }
      ]
    },
    "quiz": {
      "questions": [
        {
          "question": "What does ''decurrent'' gill attachment mean?",
          "options": ["Gills do not touch the stem", "Gills run down the stem", "Gills curve upward before attaching", "Gills attach squarely to the stem"],
          "correct": 1,
          "explanation": "Decurrent gills run down the stem, creating a visible extension below the cap-stem junction. Oyster mushrooms are a classic example."
        },
        {
          "question": "How long should you wait for a spore print?",
          "options": ["30 minutes", "1-2 hours", "4-12 hours", "24-48 hours"],
          "correct": 2,
          "explanation": "Most spore prints need 4-12 hours to develop a clear deposit. Covering with a bowl helps maintain humidity and prevents air currents from dispersing spores."
        }
      ]
    }
  }'::JSONB,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFY SEED DATA
-- ============================================================
SELECT 'specimens' as table_name, count(*) as row_count FROM specimens
UNION ALL SELECT 'specimen_photos', count(*) FROM specimen_photos
UNION ALL SELECT 'field_guides', count(*) FROM field_guides
UNION ALL SELECT 'training_modules', count(*) FROM training_modules
ORDER BY table_name;
