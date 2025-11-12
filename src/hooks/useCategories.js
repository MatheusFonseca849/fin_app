import { useState, useEffect } from 'react';
import apiService from '../services/api';

const useCategories = (user) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar categorias');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      apiService.setCurrentUser(user);
      fetchCategories();
    } else {
      setCategories([]);
      setLoading(false);
    }
  }, [user]);

  const addCategory = async (category) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const newCategory = await apiService.createCategory(category);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError('Erro ao adicionar categoria');
      console.error('Error adding category:', err);
      throw err;
    }
  };

  const updateCategory = async (id, updatedCategory) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updated = await apiService.updateCategory(id, updatedCategory);
      setCategories(prev => 
        prev.map(category => 
          category.id === id ? updated : category
        )
      );
      return updated;
    } catch (err) {
      setError('Erro ao atualizar categoria');
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      setError('Erro ao deletar categoria');
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  // Helper to get categories by type
  const getCategoriesByType = (type) => {
    return categories.filter(cat => cat.type === type);
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType
  };
};

export default useCategories;
