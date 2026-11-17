INSERT INTO services (name, slug, category, description, price_label, duration_label, image_path, is_active)
VALUES
('Knotless Braids', 'knotless-braids', 'Braids', 'Lightweight, natural-looking knotless braids styled for comfort and a polished finish.', 'Price on request', 'Duration on consultation', '/assets/images/knotless.jpeg', true),
('Normal Braids', 'normal-braids', 'Braids', 'Classic braids crafted neatly for a timeless protective style.', 'Price on request', 'Duration on consultation', '/assets/images/normal-braids.svg', true),
('Twist-outs', 'twist-outs', 'Twists', 'Defined twist-outs that celebrate natural texture with beautiful volume and shape.', 'Price on request', 'Duration on consultation', '/assets/images/twist-outs.svg', true),
('Ghanaian Hairstyles', 'ghanaian-hairstyles', 'Cornrows', 'Elegant Ghanaian-inspired cornrow styles designed with precision and creativity.', 'Price on request', 'Duration on consultation', '/assets/images/ghanians.jpeg', true)
ON CONFLICT (slug) DO NOTHING;
