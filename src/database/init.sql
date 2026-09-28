sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'delivering', 'completed', 'cancelled');
CREATE TYPE delivery_method AS ENUM ('courier', 'pickup');
CREATE TYPE payment_method AS ENUM ('cash', 'card_online', 'card_courier');

CREATE TABLE users (
    u_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL, 
    last_name VARCHAR(100) NOT NULL,  
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX idx_users_names ON users(first_name, last_name);

CREATE TABLE pizzas (
    p_id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_ordered_at TIMESTAMP 
);

CREATE TABLE ingredients (
    ingr_id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE pizza_ingredients (
    pizza_id INT NOT NULL REFERENCES pizzas(p_id) ON DELETE CASCADE,
    ingredient_id INT NOT NULL REFERENCES ingredients(ingr_id) ON DELETE CASCADE,
    PRIMARY KEY (pizza_id, ingredient_id)
);

CREATE TABLE promo_codes (
    promo_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE cart_items (
    cart_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(u_id) ON DELETE CASCADE, 
    pizza_id INT NOT NULL REFERENCES pizzas(p_id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    UNIQUE (user_id, pizza_id) 
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(u_id) ON DELETE SET NULL,
    promo_code_id INT REFERENCES promo_codes(promo_id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    delivery_method delivery_method NOT NULL,
    payment_method payment_method NOT NULL,
    comment TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE, 
    pizza_item_id INT REFERENCES pizzas(p_id) ON DELETE SET NULL, 
    title_snapshot VARCHAR(255) NOT NULL,
    price_snapshot DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);