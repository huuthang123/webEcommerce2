import React from 'react';
import '../styles/big-image.css';

const BigImage = () => {
    return (
        <div className="big-image-container">
            <div className="big-image-overlay"></div>
            <div className="big-image-content">
                <h1 className="big-image-title">Hương Việt Tinh</h1>
                <p className="big-image-subtitle">
                    Tận hưởng tinh túy từ đất trời, từng hạt, từng quả sấy khô đều giữ trọn vẹn dưỡng chất.
                </p>
            </div>
        </div>
    );
};

export default BigImage;
