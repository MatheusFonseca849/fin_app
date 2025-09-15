import React, { useState } from 'react';
import { mockTransactions, categories } from '../data/mockData';

const Transactions = ({ user }) => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'debito',
    category: 'alimentacao',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = filter === 'all' || transaction.type === filter;
    const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: newTransaction.type === 'debito' 
        ? -Math.abs(parseFloat(newTransaction.amount))
        : Math.abs(parseFloat(newTransaction.amount))
    };
    
    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      type: 'debito',
      category: 'alimentacao',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    setNewTransaction({
      ...newTransaction,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Extrato de Transações</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancelar' : 'Nova Transação'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Adicionar Nova Transação</h3>
          <form onSubmit={handleAddTransaction}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select
                  name="category"
                  value={newTransaction.category}
                  onChange={handleInputChange}
                  required
                >
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
              Adicionar Transação
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '150px' }}>
            <label>Filtrar por Tipo</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="credito">Créditos</option>
              <option value="debito">Débitos</option>
            </select>
          </div>
          <div className="form-group" style={{ minWidth: '150px' }}>
            <label>Filtrar por Categoria</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">Todas</option>
              {Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={transaction.type === 'credito' ? 'positive' : 'negative'}>
                    {transaction.type === 'credito' ? 'Crédito' : 'Débito'}
                  </span>
                </td>
                <td>{categories[transaction.category]}</td>
                <td>{transaction.description}</td>
                <td className={transaction.amount >= 0 ? 'positive' : 'negative'}>
                  R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Nenhuma transação encontrada com os filtros selecionados.
          </p>
        )}
      </div>
    </div>
  );
};

export default Transactions;
