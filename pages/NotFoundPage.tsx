
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-indigo-600">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-2">Página não encontrada</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-4">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link 
        to="/" 
        className="mt-6 inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Voltar para o Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
