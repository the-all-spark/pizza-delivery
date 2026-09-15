sql
-- 1. Создание перечислений (Enums)
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'delivering', 'completed', 'cancelled');
CREATE TYPE delivery_method AS ENUM ('courier', 'pickup');
CREATE TYPE payment_method AS ENUM ('cash', 'card_online', 'card_courier');

-- 2. Таблица пользователей
CREATE TABLE users (
    u_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL, 
    last_name VARCHAR(100) NOT NULL,  
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
-- Индекс для быстрого поиска по имени и фамилии
CREATE INDEX idx_users_names ON users(first_name, last_name);

-- 3. Таблица пицц
CREATE TABLE pizzas (
    p_id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL, -- Ссылка на локальный файл на сервере
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_ordered_at TIMESTAMP 
);

-- 4. Таблица Ингредиенты
CREATE TABLE ingredients (
    ingr_id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 5. Таблица pizza_ingredients
-- Связующая таблица Many-to-Many с составным первичным ключом
CREATE TABLE pizza_ingredients (
    pizza_id INT NOT NULL REFERENCES pizzas(p_id) ON DELETE CASCADE,
    ingredient_id INT NOT NULL REFERENCES ingredients(ingr_id) ON DELETE CASCADE,
    PRIMARY KEY (pizza_id, ingredient_id)
);

-- 6. Таблица промокодов
CREATE TABLE promo_codes (
    promo_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    expires_at TIMESTAMP NOT NULL, -- Ограниченный срок действия
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 7. Таблица элементов корзины
CREATE TABLE cart_items (
    cart_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(u_id) ON DELETE CASCADE, -- При удалении юзера чистим корзину
    pizza_id INT NOT NULL REFERENCES pizzas(p_id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    UNIQUE (user_id, pizza_id) -- Не позволяет дублировать пиццу в корзине, только увеличивать количество --?
);

-- 8. Таблица заказов
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(u_id) ON DELETE SET NULL, -- Если юзер удалился, заказ в истории остается для аналитики
    promo_code_id INT REFERENCES promo_codes(promo_id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    delivery_method delivery_method NOT NULL,
    payment_method payment_method NOT NULL,
    comment TEXT,
    total_price DECIMAL(10, 2) NOT NULL, -- Финальная цена с учетом промокода
    status order_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Таблица содержимого заказа (какие пиццы и по какой цене вошли в конкретный заказ)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    -- order_item_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE, 
    pizza_item_id INT REFERENCES pizzas(p_id) ON DELETE SET NULL, -- Если пиццу удалят из меню, история заказа не ломается
    title_snapshot VARCHAR(255) NOT NULL, -- Фиксируем название на момент заказа
    price_snapshot DECIMAL(10, 2) NOT NULL, -- Фиксируем цену на момент заказа
    quantity INT NOT NULL CHECK (quantity > 0)
);