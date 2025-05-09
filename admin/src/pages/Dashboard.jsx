import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h2>Trang quản lý Admin</h2>
      <nav>
        <Link to="/products">Quản lý sản phẩm</Link> |{' '}
        <Link to="/orders">Quản lý đơn hàng</Link>
      </nav>
    </div>
  );
};

export default Dashboard;