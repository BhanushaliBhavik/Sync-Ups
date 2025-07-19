-- Real Estate Platform Schema (Fully Clerk Compatible)
-- All IDs use text type for Clerk compatibility

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS property_views CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS comparisons CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS property_documents CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (Clerk compatible)
CREATE TABLE users (
    id text PRIMARY KEY, -- Use Clerk user ID as primary key
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    profile_image_url text,
    location_preference text,
    is_verified boolean DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles (buyer, seller, agent, admin)
CREATE TABLE user_roles (
    user_id text,
    role VARCHAR(50) CHECK (role IN ('buyer', 'seller', 'agent', 'admin')),
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Properties table
CREATE TABLE properties (
    id text PRIMARY KEY DEFAULT 'prop_' || substr(md5(random()::text), 1, 20),
    title text NOT NULL,
    description text,
    price decimal(12,2),
    property_type text CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'inactive')),
    bedrooms integer,
    bathrooms integer,
    square_feet integer,
    lot_size integer,
    year_built integer,
    address text,
    city text,
    state text,
    zip_code text,
    latitude decimal(10,8),
    longitude decimal(11,8),
    agent_id text REFERENCES users(id) ON DELETE SET NULL,
    seller_id text REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Property images
CREATE TABLE property_images (
    id text PRIMARY KEY DEFAULT 'img_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    caption text,
    is_primary boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Property documents
CREATE TABLE property_documents (
    id text PRIMARY KEY DEFAULT 'doc_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    document_url text NOT NULL,
    document_type text CHECK (document_type IN ('contract', 'disclosure', 'inspection', 'other')),
    title text,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Inquiries table
CREATE TABLE inquiries (
    id text PRIMARY KEY DEFAULT 'inq_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    message text NOT NULL,
    contact_preference text CHECK (contact_preference IN ('email', 'phone', 'text')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Visits table
CREATE TABLE visits (
    id text PRIMARY KEY DEFAULT 'vis_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Favorites table
CREATE TABLE favorites (
    id text PRIMARY KEY DEFAULT 'fav_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(property_id, user_id)
);

-- Comparisons table
CREATE TABLE comparisons (
    id text PRIMARY KEY DEFAULT 'cmp_' || substr(md5(random()::text), 1, 20),
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Comparison items (many-to-many relationship)
CREATE TABLE comparison_items (
    comparison_id text REFERENCES comparisons(id) ON DELETE CASCADE,
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    added_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (comparison_id, property_id)
);

-- Notifications table
CREATE TABLE notifications (
    id text PRIMARY KEY DEFAULT 'not_' || substr(md5(random()::text), 1, 20),
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text CHECK (type IN ('inquiry', 'visit', 'favorite', 'system', 'price_change')),
    is_read boolean DEFAULT false,
    related_property_id text REFERENCES properties(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

-- Reviews table
CREATE TABLE reviews (
    id text PRIMARY KEY DEFAULT 'rev_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(property_id, user_id)
);

-- Property views analytics
CREATE TABLE property_views (
    id text PRIMARY KEY DEFAULT 'pvw_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE SET NULL, -- nullable for anonymous views
    ip_address inet,
    user_agent text,
    viewed_at timestamp with time zone DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_seller_id ON properties(seller_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created_at ON properties(created_at);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(property_id, is_primary) WHERE is_primary = true;

CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

CREATE INDEX idx_visits_property_id ON visits(property_id);
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_scheduled_date ON visits(scheduled_date);
CREATE INDEX idx_visits_status ON visits(status);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);

CREATE INDEX idx_comparisons_user_id ON comparisons(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_user_id ON property_views(user_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own roles" ON user_roles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Properties policies (public read, owner/agent write)
CREATE POLICY "Anyone can view active properties" ON properties
    FOR SELECT USING (status = 'active');

CREATE POLICY "Agents can view their own properties" ON properties
    FOR SELECT USING (auth.uid()::text = agent_id);

CREATE POLICY "Sellers can view their own properties" ON properties
    FOR SELECT USING (auth.uid()::text = seller_id);

CREATE POLICY "Agents can insert properties" ON properties
    FOR INSERT WITH CHECK (auth.uid()::text = agent_id);

CREATE POLICY "Agents can update their own properties" ON properties
    FOR UPDATE USING (auth.uid()::text = agent_id);

CREATE POLICY "Sellers can update their own properties" ON properties
    FOR UPDATE USING (auth.uid()::text = seller_id);

-- Property images policies
CREATE POLICY "Anyone can view property images" ON property_images
    FOR SELECT USING (true);

CREATE POLICY "Agents can insert property images" ON property_images
    FOR INSERT WITH CHECK (
        property_id IN (
            SELECT id FROM properties WHERE agent_id = auth.uid()::text
        )
    );

-- Property documents policies
CREATE POLICY "Anyone can view property documents" ON property_documents
    FOR SELECT USING (true);

CREATE POLICY "Agents can insert property documents" ON property_documents
    FOR INSERT WITH CHECK (
        property_id IN (
            SELECT id FROM properties WHERE agent_id = auth.uid()::text
        )
    );

-- Inquiries policies
CREATE POLICY "Users can view their own inquiries" ON inquiries
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Agents can view inquiries for their properties" ON inquiries
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM properties WHERE agent_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert inquiries" ON inquiries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Visits policies
CREATE POLICY "Users can view their own visits" ON visits
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Agents can view visits for their properties" ON visits
    FOR SELECT USING (
        property_id IN (
            SELECT id FROM properties WHERE agent_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert visits" ON visits
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
R...