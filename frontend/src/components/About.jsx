import React from 'react';
import '../styles/about.css';
import { useAuth } from '../context/AuthContext'; // Import useAuth từ AuthContext

function About() {
    const { user } = useAuth(); // Lấy thông tin user từ context

    console.log("Rendering About component"); // Thêm log để kiểm tra

    return (
        <section className="about section-padding" id="about">
            <div className="container">
                <div className="row">
                    <div className="section-title">
                        <h2 data-title="">Giới thiệu về chúng tôi</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="about-item">
                        <h2>Shop đồ khô organic - Tinh hoa của người Việt</h2>
                        <p>
                            Hương Việt Tinh là shop chuyên mang đến những sản phẩm khô organic, được chế tác từ bàn tay và tâm huyết của người Việt. Khởi nguồn từ thành phố Đà Nẵng, qua 10 năm hình thành và phát triển, Hương Việt Tinh đã lan tỏa những món quà tinh túy từ thiên nhiên Việt đến 03 thành phố lớn nhất trên cả nước.
                        </p>
                        <div className="action-group" id="userAction">
                            {user ? (
                                <p className="welcome-message">Chào {user.username} đến với Hương Việt Tinh - Shop đồ khô organic!</p>
                            ) : (
                                <>
                                    <button className="btn" id="loginBtn">
                                        <a href="/sign-in" target="_blank" rel="noopener">
                                            Đăng nhập
                                        </a>
                                    </button>
                                    <span className="promo-text">
                                        <a href="#" target="_blank" rel="noopener">
                                            ngay để nhận ưu đãi đặc biệt!
                                        </a>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="about-item">
                        <img src="/images/image.png" alt="Hương Việt Tinh Banner" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;