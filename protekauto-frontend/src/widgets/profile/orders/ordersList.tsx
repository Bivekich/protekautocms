import React from 'react';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
}

interface OrdersListProps {
  orders?: Order[];
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders = [] }) => {
  return (
    <div className="orders-list">
      <h2>История заказов</h2>
      {orders.length === 0 ? (
        <p>У вас нет заказов</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <div>
                <strong>Заказ #{order.id}</strong>
              </div>
              <div>Дата: {order.date}</div>
              <div>Статус: {order.status}</div>
              <div>Сумма: {order.total} ₽</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
