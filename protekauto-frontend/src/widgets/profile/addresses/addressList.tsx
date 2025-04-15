import React from 'react';

interface AddressListProps {
  addresses?: Array<any>;
}

export const AddressList: React.FC<AddressListProps> = ({ addresses = [] }) => {
  return (
    <div>
      <h2>Список адресов</h2>
      {addresses.length === 0 ? (
        <p>У вас нет сохраненных адресов</p>
      ) : (
        <ul>
          {addresses.map((address, index) => (
            <li key={index}>
              {address.city}, {address.street}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
