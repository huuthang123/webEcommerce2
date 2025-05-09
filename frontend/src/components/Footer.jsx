import React from 'react';
import '../styles/Footer.css';


function Footer() {
    return (
        <footer className="footer" id="contact">
            <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
                <div className="me-5 d-none d-lg-block">
                    <span>Liên hệ với chúng tôi qua các nền tảng mạng xã hội:</span>
                </div>
                <div className="social">
                    <a href="https://www.facebook.com/thaimarket.restaurant" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fa-brands fa-tiktok"></i>
                    </a>
                    <a href="https://www.youtube.com/@thaimarketcongtytnhh7543" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fa-brands fa-youtube"></i>
                    </a>
                    <a href="https://www.instagram.com/thaimarketdeli/" target="_blank" rel="noopener" className="me-4 text-reset">
                        <i className="fab fa-instagram"></i>
                    </a>
                </div>
            </section>

            <section>
                <div className="container text-center text-md-start mt-5">
                    <div className="row mt-3">
                        <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">
                                <i className="fas fa-gem me-3"></i>Nhóm 2
                            </h6>
                            <p></p>
                        </div>
                        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Sản Phẩm</h6>
                            <p><a href="#!" className="text-reset">Angular</a></p>
                            <p><a href="#!" className="text-reset">React</a></p>
                            <p><a href="#!" className="text-reset">Vue</a></p>
                            <p><a href="#!" className="text-reset">Laravel</a></p>
                        </div>
                        <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Link hữu ích</h6>
                            <p><a href="#!" className="text-reset">Pricing</a></p>
                            <p><a href="#!" className="text-reset">Settings</a></p>
                            <p><a href="#!" className="text-reset">Orders</a></p>
                            <p><a href="#!" className="text-reset">Help</a></p>
                        </div>
                        <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Liên Hệ</h6>
                            <p><i className="fas fa-home me-3"></i>10 Trần Phú, Hà Đông, Hà Nội</p>
                            <p><i className="fas fa-envelope me-3"></i><a href="mailto:example@email.com">example@email.com</a></p>
                            <p><i className="fas fa-phone me-3"></i>+84 234 567 89</p>
                            <p><i className="fas fa-print me-3"></i>+84 234 567 89</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="text-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                © 2024 Copyright:
                <a className="text-reset fw-bold" href="https://mdbootstrap.com/">Nhóm 2</a>
            </div>
        </footer>
    );
}

export default Footer;