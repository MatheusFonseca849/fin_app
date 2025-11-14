import React, { useState } from 'react';
import useCategories from '../hooks/useCategories';

const Categories = ({ user }) => {
  const { 
    categories, 
    loading, 
    error, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories(user);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'debito',
    color: '#FF6384'
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formError, setFormError] = useState(null);

  // Predefined color palette
  const colorPalette = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4CAF50', '#2196F3',
    '#FFC107', '#E91E63', '#9C27B0', '#00BCD4', '#8BC34A'
  ];

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate name
    if (!newCategory.name.trim()) {
      setFormError('Nome da categoria não pode estar vazio');
      return;
    }

    // Check for duplicate name
    const isDuplicate = categories.some(
      cat => cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setFormError('Já existe uma categoria com este nome');
      return;
    }

    try {
      await addCategory({
        name: newCategory.name.trim(),
        type: newCategory.type,
        color: newCategory.color
      });

      // Reset form
      setNewCategory({
        name: '',
        type: 'debito',
        color: '#FF6384'
      });
      setShowAddForm(false);
    } catch (err) {
      setFormError(err.message || 'Erro ao criar categoria');
    }
  };

  const handleEditCategory = (category) => {
    if (category.isDefault) {
      alert('Categorias padrão não podem ser editadas');
      return;
    }
    setEditingCategory({ ...category });
    setShowEditModal(true);
    setFormError(null);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate name
    if (!editingCategory.name.trim()) {
      setFormError('Nome da categoria não pode estar vazio');
      return;
    }

    // Check for duplicate name (excluding current category)
    const isDuplicate = categories.some(
      cat => cat.id !== editingCategory.id && 
             cat.name.toLowerCase() === editingCategory.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setFormError('Já existe uma categoria com este nome');
      return;
    }

    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        type: editingCategory.type,
        color: editingCategory.color
      });
      setEditingCategory(null);
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.message || 'Erro ao atualizar categoria');
    }
  };

  const handleDeleteClick = (category) => {
    if (category.isDefault) {
      alert('Categorias padrão não podem ser excluídas');
      return;
    }
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      alert(err.message || 'Erro ao deletar categoria');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  // Separate categories by type
  const debitoCategories = categories.filter(cat => cat.type === 'debito');
  const creditoCategories = categories.filter(cat => cat.type === 'credito');

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
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Gerenciar Categorias</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFormError(null);
          }}
        >
          {showAddForm ? 'Cancelar' : 'Nova Categoria'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Adicionar Nova Categoria</h3>
          {formError && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '10px', 
              borderRadius: '5px', 
              marginBottom: '15px',
              border: '1px solid #f5c6cb'
            }}>
              {formError}
            </div>
          )}
          <form onSubmit={handleAddCategory}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Nome da Categoria *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Ex: Educação"
                  maxLength="50"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  required
                >
                  <option value="debito">Débito (Gastos)</option>
                  <option value="credito">Crédito (Receitas)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cor</label>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: color,
                        border: newCategory.color === color ? '3px solid #000' : '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  style={{ marginTop: '10px', width: '100%', height: '40px' }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
              Adicionar Categoria
            </button>
          </form>
        </div>
      )}

      {/* Débito Categories */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Categorias de Débito (Gastos)</h3>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Cor</th>
              <th>Nome</th>
              <th style={{ width: '100px' }}>Tipo</th>
              <th style={{ width: '150px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {debitoCategories.map(category => (
              <tr key={category.id}>
                <td>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: category.color,
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }} />
                </td>
                <td>
                  {category.name}
                  {category.isDefault && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '11px', 
                      color: '#666',
                      backgroundColor: '#e9ecef',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      Padrão
                    </span>
                  )}
                </td>
                <td>
                  <span className="negative">Débito</span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEditCategory(category)}
                    disabled={category.isDefault}
                    style={{ 
                      marginRight: '5px', 
                      padding: '5px 10px', 
                      backgroundColor: category.isDefault ? '#ccc' : '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: category.isDefault ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(category)}
                    disabled={category.isDefault}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: category.isDefault ? '#ccc' : '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: category.isDefault ? 'not-allowed' : 'pointer',
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
        {debitoCategories.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Nenhuma categoria de débito encontrada.
          </p>
        )}
      </div>

      {/* Crédito Categories */}
      <div className="card">
        <h3>Categorias de Crédito (Receitas)</h3>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Cor</th>
              <th>Nome</th>
              <th style={{ width: '100px' }}>Tipo</th>
              <th style={{ width: '150px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {creditoCategories.map(category => (
              <tr key={category.id}>
                <td>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: category.color,
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }} />
                </td>
                <td>
                  {category.name}
                  {category.isDefault && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '11px', 
                      color: '#666',
                      backgroundColor: '#e9ecef',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      Padrão
                    </span>
                  )}
                </td>
                <td>
                  <span className="positive">Crédito</span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEditCategory(category)}
                    disabled={category.isDefault}
                    style={{ 
                      marginRight: '5px', 
                      padding: '5px 10px', 
                      backgroundColor: category.isDefault ? '#ccc' : '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: category.isDefault ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(category)}
                    disabled={category.isDefault}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: category.isDefault ? '#ccc' : '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: category.isDefault ? 'not-allowed' : 'pointer',
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
        {creditoCategories.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Nenhuma categoria de crédito encontrada.
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingCategory && (
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
            <h3>Editar Categoria</h3>
            {formError && (
              <div style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '10px', 
                borderRadius: '5px', 
                marginBottom: '15px',
                border: '1px solid #f5c6cb'
              }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label>Nome da Categoria *</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  maxLength="50"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select
                  value={editingCategory.type}
                  onChange={(e) => setEditingCategory({ ...editingCategory, type: e.target.value })}
                  required
                >
                  <option value="debito">Débito (Gastos)</option>
                  <option value="credito">Crédito (Receitas)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cor</label>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: color,
                        border: editingCategory.color === color ? '3px solid #000' : '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={editingCategory.color}
                  onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                  style={{ marginTop: '10px', width: '100%', height: '40px' }}
                />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setFormError(null);
                  }}
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
      {showDeleteModal && categoryToDelete && (
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
            <p>Tem certeza que deseja excluir esta categoria?</p>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: categoryToDelete.color,
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }} />
                <div>
                  <strong>{categoryToDelete.name}</strong><br />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {categoryToDelete.type === 'credito' ? 'Crédito' : 'Débito'}
                  </span>
                </div>
              </div>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#856404', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px', border: '1px solid #ffeeba' }}>
              ⚠️ As transações desta categoria serão movidas para "Sem Categoria"
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDeleteModal(false)}
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
                onClick={handleDeleteCategory}
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

export default Categories;
