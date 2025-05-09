import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/menu.css';
import { fetchMenuItems } from '../services/menuService';
import { useCart } from '../context/CartContext';

function Menu() {
    const [fruitItems, setFruitItems] = useState([]);
    const [seafoodItems, setSeafoodItems] = useState([]);
    const [meatItems, setMeatItems] = useState([]);
    const [nutItems, setNutItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState({
        all: true,
        fruit: false,
        seafood: false,
        meat: false,
        nut: false,
    });
    const [sortOption, setSortOption] = useState('default');
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Hàm ánh xạ size từ giao diện sang cơ sở dữ liệu
    const mapSizeToDatabase = (size) => {
        switch (size) {
            case '250': return '250';
            case '500': return '500';
            case '1000': return '1000';
            default: return size;
        }
    };

    // Hàm lấy giá từ schema prices
    const getPriceFromSchema = (item, size) => {
        const dbSize = mapSizeToDatabase(size);
        return item.prices?.[dbSize] || 0;
    };

    // Fetch dữ liệu từ API
    useEffect(() => {
        fetchMenuItems('fruit').then((items) => {
            setFruitItems(items);
            setAllItems((prev) => [...prev, ...items.map(item => ({ ...item, category: 'fruit' }))]);
        });
        fetchMenuItems('seafood').then((items) => {
            setSeafoodItems(items);
            setAllItems((prev) => [...prev, ...items.map(item => ({ ...item, category: 'seafood' }))]);
        });
        fetchMenuItems('meat').then((items) => {
            setMeatItems(items);
            setAllItems((prev) => [...prev, ...items.map(item => ({ ...item, category: 'meat' }))]);
        });
        fetchMenuItems('nut').then((items) => {
            setNutItems(items);
            setAllItems((prev) => [...prev, ...items.map(item => ({ ...item, category: 'nut' }))]);
        });
    }, []);

    // Lọc và sắp xếp sản phẩm
    useEffect(() => {
        let itemsToFilter = [...allItems];

        // Lọc theo danh mục
        if (!categories.all) {
            itemsToFilter = itemsToFilter.filter(item => {
                return (
                    (categories.fruit && item.category === 'fruit') ||
                    (categories.seafood && item.category === 'seafood') ||
                    (categories.meat && item.category === 'meat') ||
                    (categories.nut && item.category === 'nut')
                );
            });
        }

        // Sắp xếp sản phẩm
        if (sortOption === 'low-to-high') {
            itemsToFilter.sort((a, b) => {
                const priceA = getPriceFromSchema(a, '250') || 0;
                const priceB = getPriceFromSchema(b, '250') || 0;
                return priceA - priceB;
            });
        } else if (sortOption === 'high-to-low') {
            itemsToFilter.sort((a, b) => {
                const priceA = getPriceFromSchema(a, '250') || 0;
                const priceB = getPriceFromSchema(b, '250') || 0;
                return priceB - priceA;
            });
        } else if (sortOption === 'best-seller') {
            itemsToFilter.sort((a, b) => {
                const soldA = a.sold || 0;
                const soldB = b.sold || 0;
                return soldB - soldA; // Sắp xếp giảm dần theo số lượng đã bán
            });
        }

        setFilteredItems(itemsToFilter);
    }, [allItems, categories, sortOption]);

    // Xử lý thay đổi checkbox danh mục
    const handleCategoryChange = (category) => {
        if (category === 'all') {
            setCategories({
                all: true,
                fruit: false,
                seafood: false,
                meat: false,
                nut: false,
            });
        } else {
            setCategories((prev) => ({
                ...prev,
                [category]: !prev[category],
                all: false,
            }));
        }
    };

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    // Xử lý thêm vào giỏ hàng
    const handleAddToCart = (item) => {
        const selectedSize = '250'; // Kích thước mặc định
        const price = getPriceFromSchema(item, selectedSize);
        if (price === 0) {
            console.error("Lỗi: Không tìm thấy giá sản phẩm", item);
            return;
        }

        const dbSize = mapSizeToDatabase(selectedSize);

        addToCart({
            productId: item._id,
            name: item.name,
            price: price,
            image: item.image,
            size: dbSize,
            quantity: 1,
        });
    };

    // Render sản phẩm
    const renderMenuItems = () => (
        <div className="menu-lists">
            {filteredItems.map((item) => {
                const currentPrice = getPriceFromSchema(item, '250');
                const originalPrice = currentPrice / (1 - 0.17); // Giảm 17%
                const discountPercentage = 17;

                return (
                    <div className="food-items" key={item._id}>
                        <div
                            className="food-item"
                            onClick={() => navigate(`/${item.category}/${item._id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <img src={item.image} alt={item.name} />
                            <h2>{item.name}</h2>
                        </div>
                        <div className="food-price">
                            <span className="current-price">
                                {currentPrice
                                    ? `${currentPrice.toLocaleString()} VND`
                                    : "Giá chưa cập nhật"}
                            </span>
                            {originalPrice && (
                                <span className="original-price">
                                    {Math.round(originalPrice).toLocaleString()} VND
                                </span>
                            )}
                            {discountPercentage && (
                                <span className="discount">-{discountPercentage}%</span>
                            )}
                        </div>
                        <div className="food-meta">
                            <span>⭐ {item.rating || 5.0}</span>
                            <span>Đã bán {item.sold || 0}</span>
                        </div>
                        <button
                            className="add-to-cart-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item);
                            }}
                        >
                            🛒
                        </button>
                    </div>
                );
            })}
        </div>
    );

    return (
        <section className="menu" id="dactrung">
            <div className="menu-wrapper">
                {/* Sidebar danh mục */}
                <div className="menu-sidebar">
                    <h3>Danh Mục</h3>
                    <div className="category-checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={categories.all}
                                onChange={() => handleCategoryChange('all')}
                            />
                            Tất cả sản phẩm
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={categories.fruit}
                                onChange={() => handleCategoryChange('fruit')}
                            />
                            Trái Cây Sấy
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={categories.seafood}
                                onChange={() => handleCategoryChange('seafood')}
                            />
                            Hải Sản Sấy
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={categories.meat}
                                onChange={() => handleCategoryChange('meat')}
                            />
                            Thịt Sấy
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={categories.nut}
                                onChange={() => handleCategoryChange('nut')}
                            />
                            Hạt Sấy
                        </label>
                    </div>
                </div>

                {/* Phần nội dung chính */}
                <div className="menu-main-content">
                    {/* Tiêu đề */}
                    <div className="section-title">
                        <h2 data-title="">SẢN PHẨM CỦA CHÚNG TÔI</h2>
                    </div>

                    {/* Tagline */}
                    <div className="menu-title">
                        <h2>Tận hưởng vị ngon tự nhiên từ thực phẩm sấy khô...</h2>
                    </div>

                    {/* Phần sản phẩm */}
                    <div className="menu-products">
                        {/* Sắp xếp */}
                        <div className="menu-sort">
                            <select value={sortOption} onChange={handleSortChange}>
                                <option value="default">Sắp xếp: Mặc định</option>
                                <option value="low-to-high">Giá: Thấp đến cao</option>
                                <option value="high-to-low">Giá: Cao đến thấp</option>
                                <option value="best-seller">Bán chạy</option>
                            </select>
                        </div>

                        {/* Hiển thị sản phẩm */}
                        {renderMenuItems()}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Menu;