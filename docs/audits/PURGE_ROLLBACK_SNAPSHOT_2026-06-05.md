# PROVENANCE PURGE — ROLLBACK SNAPSHOT
Captured 2026-06-05, repo @0c16930, DB @zspcmvdoqhvrcdynlriz (joblux-platform)
Pre-mutation state of all 80 targeted items. Rollback = restore these exact states.

## Mutation plan
- wikilux_content (72): is_published true→false, status approved→archived
- events (4): is_published true→false
- signals (2): is_published true→false
- bloglux_articles (2): status published→review

## Rollback = re-apply original state below (by id)

### wikilux_content — 72 rows, all (is_published=true, status=approved)
d94caa8f-9e0a-444f-ab6c-a7ebd76bbdb6 Aman Resorts
84ff4b91-51fd-4669-aba6-4c0d3453a2fc Bang & Olufsen
44275f5a-2bd9-4939-9343-a9fa8092e570 Artcurial
66c41e3b-4a58-4c37-8adf-209f3dcc2d43 Buccellati
ec65bfe9-8061-4885-9d5e-8c4181112010 Etro
6d59ac14-be05-4a49-b5be-3a93be2dbd0d J.M. Weston
bd0fc00c-1fd7-4ad7-af09-70ebcfb5ed9f Christie's
b9839b3c-41b8-4ad0-8024-8749942bc375 Bonhams
c296c762-68df-4c1f-8941-d757c9421db3 Santoni
a57f34bb-9b87-4793-af3d-c2a1faf0351e Raffles Hotels
16739524-e282-484e-91c5-6aa1bde06131 Lalique
560f2cf2-5c31-4571-a1bb-d8ec5be490b4 NOMOS Glashütte
aeb44d8f-6382-4dd5-9292-f96abe07603d The Dalmore
33fffd03-a0b3-482e-92c5-a4a9e0fa826a Louis XIII
7001c53d-4fd8-4e2a-b7c9-0f53ea41baa0 Repossi
e41083ec-ce6b-4c1e-9c65-8496faef29cf Smythson
9bed0664-6a1d-4930-bc8d-ad43c6522e5a Manolo Blahnik
1bbd578a-f36a-42c5-b60d-2c3d45af1afc Moynat
8dd80a5b-de70-4e63-a2da-5fe09a094329 Royal Salute
52e92948-5808-4b82-8d50-ecc44d2559d3 Sotheby's
2664d240-302f-465f-adcd-83254fb98b96 Pace Gallery
c4ed691d-448d-45c1-a834-50a7964da24f Phillips Auction
8d3881fb-3ec0-45e9-b2b4-db0c09f10981 Gagosian Gallery
cdfe1ba1-96d9-42a9-bad5-5c55c36940b5 Hauser & Wirth
96f7badc-a5da-40e8-b8e3-040c6f6c76f6 AMI Paris
33fb19d5-91f9-47ea-ac28-9b35d474e884 Mikimoto
572b63c6-22be-435e-81e3-617a7c725924 Rabanne
a051fe20-b1b7-42cc-86d2-619b92cbb14b Ritz Paris
917e317d-885d-46b0-a4bf-3d299c2a4c91 The Row
cb7604e2-eaa1-4592-bbe8-2861c10a2a36 Montblanc
a2bc62b4-c8e2-44ee-845b-2a1d429d54a0 Khaite
f9014134-5fed-4fa7-855d-057f2d6c9fa8 David Yurman
8912f43c-c6f0-4cbb-883d-e341c9ab1194 Fred
c1d60f31-3785-49a7-9cbd-209eb69aa131 Grand Seiko
1a076655-c9e6-46bf-9e78-e956eb504568 Johnnie Walker Blue Label
720cae40-99e4-420f-9785-6bb44c3433f4 Laurent-Perrier
12465c6e-3977-4bb4-ad82-f6f408819f30 Perrier-Jouët
fe686948-52c2-4d21-9094-177cd825005e Ruinart
693fa084-9539-44a3-83ae-414b2eadaeb5 Taittinger
21591a15-79bb-423a-b1fe-b69bdfb0c76f The Macallan
a41539cd-e0a8-411e-84e4-1382cdc94758 Berluti (NOTE: was the 1 human-edited row)
152791ce-54c1-409c-a40b-d6a0182380ce Delvaux
be3780ee-8f21-4be4-9347-905cad76d698 Sisley Paris
d36d8c8c-45f1-4a0c-b0be-cde42f68f4d4 The Peninsula
ff47c1ee-63a2-45e0-9364-a3761f3a2fab One&Only Resorts
b4be0416-2efc-40fc-a048-423fc14fab9e RIMOWA
9cfe18b7-24cc-48c8-8847-a59488676706 TUMI
8c7bef8e-c2cb-45b8-a41a-fa8471237d43 Veuve Clicquot
a51a80b9-fe67-4330-9617-da178c58eaea Tod's
d49609df-a7a7-420e-bdb2-efddd212c42d Jo Malone London
e25aacc4-3b61-46b5-8bc1-0e0f2569e41c Rosewood Hotels
c6b75df1-6d47-4a01-8a84-7871be568c77 Bremont
1afc975a-52bf-4771-95a5-3333956dcda2 Christofle
803f88d5-a468-4ad2-8d2b-50c8eb11bd6d Clase Azul
70fb4228-0b82-459e-9c6a-548f5fd09570 Globe-Trotter
980fb2d9-f3e7-4860-91a0-f65c8234862d Goyard
30a7176b-acc2-42f0-82ef-152e992a7cce Jimmy Choo
8414d973-e61a-4724-8ae1-3acc413b1fda John Lobb
dec992ad-9bc5-461d-8947-8b6151f97624 Aquazzura
11b29044-6b05-43cb-a069-123bcba3d279 Armand de Brignac
77bc66c0-9f49-4068-99ba-2d003b153368 Breitling
5fb31b63-56e1-4c52-8dfd-c30ec2c96aec Girard-Perregaux
3c64e1d8-716f-4ccd-8058-bf7af09eeb75 Moncler
e02aa6b8-d0bd-4cd0-943c-f61f72d7bb4b Puiforcat
d0de8903-211a-452c-98af-9dd4ca135905 Roger Vivier
de824794-bf23-49bf-80e6-2d938dfde4a9 The Connaught
d3c91599-b5db-4d2b-9ba4-5e316adc9d5c Bernardaud
2113c463-bc36-4007-8ab6-1ecda55dd5aa Chloé
ee147fae-0a1e-47f9-a1e8-ce4cd661a7a4 Claridge's
283654ff-d342-47a3-976a-62043190932a F.P. Journe
4f3d3859-28aa-46ee-95d2-800ba61734bb Baccarat
eaa729fe-b3d8-4abb-a715-35336b0ad0c6 Salvatore Ferragamo

### events — 4 rows (is_published=true)
396930ef-e5a9-4c02-88ab-be2b32876fc4 Vicenzaoro September 2026 - International Jewellery Fair
9a2481ad-61e7-496d-a40e-6c586c38020d Watches & Wonders 2026 - Luxury Watch Fair
5f6c17a7-6252-4fd4-b2f7-492f69022c1d The Salon Art + Design 2026 - New York
2ac671b0-4a0e-4f28-9155-bc5f500c4c36 Hong Kong Jewellery & Gem Fair 2026 - Trade Fair

### signals — 2 rows (is_published=true)
246f1cfc-9099-4db7-99d2-eecd85c85481 Prada Appoints Heritage Expert to Lead Product Strategy and Sustainability
a6ec3d31-845e-4d23-9ce4-9092afd22a98 Executive moves announced across Cartier, Tom Ford, Rolls-Royce, Bremont

### bloglux_articles — 2 rows (status=published)
a00ad543-f6c4-4950-ab5a-cd3ddb31adf3 Reading the Signals: What Luxury Market Movements Mean for Careers
129eb43b-32cf-43ad-8628-9ec6102c25e4 Luxury Career Ladder: Professional Progression Across Maisons in 2026
