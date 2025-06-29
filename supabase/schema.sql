-- AnnaPurna Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create households table
CREATE TABLE households (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create household_members table
CREATE TABLE household_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(household_id, user_id)
);

-- Create pantry_items table
CREATE TABLE pantry_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    expiration_date DATE,
    purchase_date DATE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_list table
CREATE TABLE shopping_list (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL,
    is_purchased BOOLEAN DEFAULT FALSE,
    added_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('expiry_warning', 'low_stock', 'general')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_pantry_items_household_id ON pantry_items(household_id);
CREATE INDEX idx_pantry_items_expiration_date ON pantry_items(expiration_date);
CREATE INDEX idx_pantry_items_category ON pantry_items(category);
CREATE INDEX idx_shopping_list_household_id ON shopping_list(household_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pantry_items_updated_at BEFORE UPDATE ON pantry_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_updated_at BEFORE UPDATE ON shopping_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Households policies
CREATE POLICY "Users can view households they are members of" ON households
    FOR SELECT USING (
        id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create households" ON households
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Household owners and admins can update households" ON households
    FOR UPDATE USING (
        id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Household owners can delete households" ON households
    FOR DELETE USING (
        id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Household members policies
CREATE POLICY "Users can view household members of their households" ON household_members
    FOR SELECT USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join households" ON household_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Household owners and admins can manage members" ON household_members
    FOR ALL USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Pantry items policies
CREATE POLICY "Users can view pantry items of their households" ON pantry_items
    FOR SELECT USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create pantry items in their households" ON pantry_items
    FOR INSERT WITH CHECK (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        ) AND created_by = auth.uid()
    );

CREATE POLICY "Users can update pantry items in their households" ON pantry_items
    FOR UPDATE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete pantry items in their households" ON pantry_items
    FOR DELETE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Shopping list policies
CREATE POLICY "Users can view shopping list of their households" ON shopping_list
    FOR SELECT USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create shopping list items in their households" ON shopping_list
    FOR INSERT WITH CHECK (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        ) AND added_by = auth.uid()
    );

CREATE POLICY "Users can update shopping list items in their households" ON shopping_list
    FOR UPDATE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete shopping list items in their households" ON shopping_list
    FOR DELETE USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());
