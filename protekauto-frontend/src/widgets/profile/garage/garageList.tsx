import React from 'react';

interface Auto {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
}

interface GarageListProps {
  autos?: Auto[];
}

export const GarageList: React.FC<GarageListProps> = ({ autos = [] }) => {
  return (
    <div className="garage-list">
      <h2>Мои автомобили</h2>
      {autos.length === 0 ? (
        <p>У вас нет сохраненных автомобилей</p>
      ) : (
        <ul>
          {autos.map((auto) => (
            <li key={auto.id}>
              <strong>{auto.name}</strong>
              {auto.make && auto.model && (
                <span>
                  {' '}
                  - {auto.make} {auto.model} {auto.year && `(${auto.year})`}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
