import { useState, useEffect } from 'react';
import apiService from '../services/api';

const useTransactions = (user) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.getFinancialRecords();
      const transformedData = data.map(record => apiService.transformRecordToFrontend(record));
      setTransactions(transformedData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      apiService.setCurrentUser(user);
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const addTransaction = async (transaction) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const newRecord = await apiService.createFinancialRecord(transaction);
      const transformedRecord = apiService.transformRecordToFrontend(newRecord);
      setTransactions(prev => [...prev, transformedRecord]);
      return transformedRecord;
    } catch (err) {
      setError('Erro ao adicionar transação');
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id, updatedTransaction) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updatedRecord = await apiService.updateFinancialRecord(id, updatedTransaction);
      const transformedRecord = apiService.transformRecordToFrontend(updatedRecord);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? transformedRecord : transaction
        )
      );
      return transformedRecord;
    } catch (err) {
      setError('Erro ao atualizar transação');
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await apiService.deleteFinancialRecord(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (err) {
      setError('Erro ao deletar transação');
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  // Calculate statistics from current transactions
  const getCurrentBalance = () => {
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    const income = monthlyTransactions
      .filter(t => t.type === 'credito')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = monthlyTransactions
      .filter(t => t.type === 'debito')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return { income, expenses };
  };

  const getExpensesByCategory = () => {
    return transactions
      .filter(t => t.type === 'debito')
      .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {});
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getCurrentBalance,
    getMonthlyStats,
    getExpensesByCategory
  };
};

export default useTransactions;
