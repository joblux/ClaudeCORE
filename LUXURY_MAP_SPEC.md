# LUXURY MAP — PRODUCT SPEC (V1)

## Vision
The Luxury Map is an interactive intelligence map of the global luxury industry.

It visualizes:
- where luxury operates
- how it is structured
- how it evolves

It is NOT a salary map or static dataset.
It is a product-level feature and reusable intelligence layer across JOBLUX.

---

## Core Principles

- Visual-first (black background, gold borders)
- Exploration-driven (clickable countries)
- Layer-based intelligence
- Reusable across platform (Insights + Brand pages)

---

## V1 Features

### 1. Interactive World Map
- Dark UI (black / gold)
- Hover + click states
- Country selection

### 2. Country Intelligence Panel
On click:
- Country name
- Dominant sectors (top 2-3)
- Key brands present
- Atelier / production presence
- HQ presence (if applicable)
- Short strategic description
- Notable movements (signals-based)

### 3. Sector Layer
Countries lightly colored by dominant sector:
- Fashion & Accessories
- Watches & Jewellery
- Beauty
- Hospitality
- Automotive & Yachts
- Wine & Spirits
- Art & Culture
- Real Estate

### 4. Notable Movements
Connects Signals to Map. Examples:
- "Hermes opened 4 stores in Asia (2025)"
- "Luxury hospitality expanding in Middle East"

---

## Data Model

### Table: luxury_map_countries
- country_name, iso_code, dominant_sectors (array), description, key_brands (array), atelier_presence, hq_presence, notable_movements

### Bridge Table: brand_presence
- brand_id, country_code, presence_type (HQ / retail / production / expansion)

---

## Platform Integration
- Insights Page: full interactive map (dedicated tab)
- Brand Pages: embedded "Global Presence" module (same engine, filtered by brand)

## Future Layers (V2+)
- Signals overlay, Hiring activity, Events, Salary, Time evolution, City-level zoom

## Definition
"Click any country and understand its role in the global luxury industry."
