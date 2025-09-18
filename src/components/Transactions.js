import React, { useState, useEffect, useRef } from 'react';
import { categories } from '../data/mockData';
import useTransactions from '../hooks/useTransactions';
import apiService from '../services/api';

const Transactions = ({ user }) => {
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction, fetchTransactions } = useTransactions(user);
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
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const fileInputRef = useRef(null);

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = filter === 'all' || transaction.type === filter;
    const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        description: newTransaction.description,
        amount: newTransaction.type === 'credito' ? Math.abs(parseFloat(newTransaction.amount)) : -Math.abs(parseFloat(newTransaction.amount)),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date
      };

      await addTransaction(transactionData);
      
      setNewTransaction({
        type: 'debito',
        category: 'alimentacao',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
      // Error is handled by the hook
    }
  };

  const handleInputChange = (e) => {
    setNewTransaction({
      ...newTransaction,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditingTransaction({
      ...editingTransaction,
      [e.target.name]: e.target.value
    });
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction({
      ...transaction,
      amount: Math.abs(transaction.amount).toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        description: editingTransaction.description,
        amount: editingTransaction.type === 'credito' ? Math.abs(parseFloat(editingTransaction.amount)) : -Math.abs(parseFloat(editingTransaction.amount)),
        type: editingTransaction.type,
        category: editingTransaction.category,
        date: editingTransaction.date
      };

      await updateTransaction(editingTransaction.id, transactionData);
      
      setEditingTransaction(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating transaction:', err);
      // Error is handled by the hook
    }
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleDeleteTransaction = async () => {
    try {
      await deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      // Error is handled by the hook
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
          <button 
            onClick={fetchTransactions}
            style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px' }}
          >
            Tentar Novamente
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
        <h1>Extrato de Transações</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setImportMessage(null);
                setImporting(true);
                const result = await apiService.importTransactionsCSV(file);
                await fetchTransactions();
                setImportMessage(`Importação concluída: ${result.createdCount} registros adicionados${result.errorCount ? `, ${result.errorCount} erros` : ''}.`);
              } catch (err) {
                setImportMessage(`Falha ao importar CSV: ${err.message}`);
              } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          <button 
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            style={{ backgroundColor: '#17a2b8', color: 'white' }}
          >
            {importing ? 'Importando...' : 'Importar CSV'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancelar' : 'Nova Transação'}
          </button>
        </div>
      </div>

      {importMessage && (
        <div style={{ 
          backgroundColor: '#e2f0fb', 
          color: '#0c5460', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #bee5eb'
        }}>
          {importMessage}
        </div>
      )}

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
              <th>Ações</th>
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
                <td>
                  <button 
                    onClick={() => handleEditTransaction(transaction)}
                    style={{ 
                      marginRight: '5px', 
                      padding: '5px 10px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(transaction)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Excluir
                  </button>
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

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3>Editar Transação</h3>
            <form onSubmit={handleUpdateTransaction}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    name="type"
                    value={editingTransaction.type}
                    onChange={handleEditInputChange}
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
                    value={editingTransaction.category}
                    onChange={handleEditInputChange}
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
                    value={editingTransaction.description}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={editingTransaction.amount}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    name="date"
                    value={editingTransaction.date}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && transactionToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta transação?</p>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>{transactionToDelete.description}</strong><br />
              <span>{categories[transactionToDelete.category]}</span><br />
              <span className={transactionToDelete.amount >= 0 ? 'positive' : 'negative'}>
                R$ {Math.abs(transactionToDelete.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleDeleteCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteTransaction}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
