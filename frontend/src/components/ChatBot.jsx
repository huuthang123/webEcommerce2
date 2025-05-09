import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../styles/ChatBot.css';

function ChatBot() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false); // Biến kiểm soát việc chào

    const { cartItems, total, totalItems } = useCart();

    const genAI = new GoogleGenerativeAI('AIzaSyA4rBPt3rEcC0Bc0LDgille2BGAUCUbns0'); // Thay bằng API Key của bạn
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    useEffect(() => {
        // Tạo thông tin sản phẩm
        const productInfo = cartItems.length > 0
            ? cartItems.map(item => `${item.name}: ${item.price.toLocaleString()} VND, Số lượng: ${item.quantity}, Danh mục: ${item.category || 'Không xác định'}`).join('\n')
            : 'Giỏ hàng của bạn đang trống.';

        // Chỉ chào một lần khi chatbot khởi tạo
        if (!hasGreeted) {
            setChatMessages([
                { role: 'model', text: `Xin chào! Tôi là chatbot hỗ trợ giỏ hàng. Đây là danh sách sản phẩm trong giỏ hàng của bạn:\n${productInfo}\nTổng tiền: ${total.toLocaleString()} VND\nTổng số lượng: ${totalItems}\nBạn có thể hỏi tôi các câu như: "Sản phẩm Bò Kho giá bao nhiêu?", "Tổng tiền là bao nhiêu?", hoặc "Có sản phẩm nào cùng loại với Bò Kho không?"` }
            ]);
            setHasGreeted(true); // Đánh dấu đã chào
        } else {
            // Cập nhật thông tin giỏ hàng mà không chào lại
            setChatMessages(prev => {
                const updatedMessages = [...prev];
                if (updatedMessages.length > 0) {
                    updatedMessages[0] = {
                        role: 'model',
                        text: `Đây là danh sách sản phẩm trong giỏ hàng của bạn:\n${productInfo}\nTổng tiền: ${total.toLocaleString()} VND\nTổng số lượng: ${totalItems}\nBạn có thể hỏi tôi các câu như: "Sản phẩm Bò Kho giá bao nhiêu?", "Tổng tiền là bao nhiêu?", hoặc "Có sản phẩm nào cùng loại với Bò Kho không?"`
                    };
                }
                return updatedMessages;
            });
        }

        // Tự động cuộn xuống tin nhắn mới nhất
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, [cartItems, total, totalItems, hasGreeted]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        setChatMessages(prev => [...prev, { role: 'user', text: userInput }]);
        setIsChatLoading(true);

        try {
            // Tạo thông tin sản phẩm
            const productInfo = cartItems.length > 0
                ? cartItems.map(item => `${item.name}: ${item.price.toLocaleString()} VND, Số lượng: ${item.quantity}, Danh mục: ${item.category || 'Không xác định'}`).join('\n')
                : 'Giỏ hàng của bạn đang trống.';

            // Tạo prompt chi tiết
            const prompt = `
Bạn là một chatbot hỗ trợ giỏ hàng thân thiện và chuyên nghiệp. Nhiệm vụ của bạn là trả lời các câu hỏi của người dùng về giỏ hàng một cách chính xác, tự nhiên và dễ hiểu. Dưới đây là thông tin giỏ hàng hiện tại:

**Danh sách sản phẩm**:
${productInfo}

**Tổng tiền**: ${total.toLocaleString()} VND
**Tổng số lượng sản phẩm**: ${totalItems}



**Câu hỏi của người dùng**: ${userInput}

Hãy trả lời câu hỏi của người dùng một cách chính xác và tự nhiên.
            `;

            // Gọi Gemini API
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Thêm phản hồi của chatbot vào chat
            setChatMessages(prev => [...prev, { role: 'model', text }]);
        } catch (error) {
            console.error('Lỗi khi gọi Gemini API:', error);
            setChatMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, tôi không thể trả lời ngay bây giờ. Vui lòng thử lại sau!' }]);
        } finally {
            setIsChatLoading(false);
            setUserInput('');
        }
    };

    return (
        <>
            <div className="chat-icon" onClick={toggleChat}>
                💬
            </div>
            <div className={`chat-container ${isChatOpen ? '' : 'hidden'}`} id="chatContainer">
                <div className="chat-header">
                    <h2>Chat với AI</h2>
                    <button className="close-chat-btn" onClick={toggleChat}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="chat-box" id="chatBox">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            <p>{msg.text}</p>
                        </div>
                    ))}
                    {isChatLoading && <div className="chat-message model">Đang xử lý...</div>}
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        id="userInput"
                        placeholder="Nhập tin nhắn của bạn..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>Gửi</button>
                </div>
            </div>
        </>
    );
}

export default ChatBot;