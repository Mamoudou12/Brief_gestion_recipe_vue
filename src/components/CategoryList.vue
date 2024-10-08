<template>
  <div class="category-list-container">
    <button v-if="!showForm && !isEditing" @click="showForm = true" class="btn btn-primary mb-4">
      <i class="fas fa-plus-circle"></i> {{ $t('ajout_category') }}
    </button>

    <div v-if="showForm" class="add-category-container mb-4">
      <form @submit.prevent="isEditing ? handleUpdateCategory() : handleAddCategory()">
        <div class="form-group">
          <label for="categoryName">{{$t('category_name')}}</label>
          <input 
            v-model="newCategory.title" 
            type="text" 
            id="categoryName" 
            class="form-control" 
            :placeholder="$t('nom_categorie')" 
            required 
          />
        </div>

        <transition name="fade">
          <div v-if="errorMessage" class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
          </div>
        </transition>
        <transition name="fade">
          <div v-if="successMessage" class="alert alert-success">
            <i class="fas fa-check-circle"></i> {{ successMessage }}
          </div>
        </transition>

        <div class="form-actions d-flex justify-content-between">
          <button type="submit" class="btn" :class="isEditing ? 'btn-success' : 'btn-primary'">
            <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            {{ isEditing ? 'Modifier' : 'Ajouter' }} la catégorie
          </button>
          <button v-if="isEditing" type="button" class="btn btn-secondary" @click="cancelEdit">
            <i class="fas fa-times"></i> Annuler
          </button>
        </div>
      </form>
    </div>

    <h2 class="text-primary mb-4 d-flex align-items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-list me-2" viewBox="0 0 16 16">
        <path d="M3.5 8a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm-9-4a.5.5 0 0 1-.5-.5V1a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V1a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V1a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zM1 5.5A.5.5 0 0 1 1.5 5h13a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5v-.5zM1 10.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5v-.5z"/>
      </svg>
      {{ $t('category_list') }}
    </h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>{{ $t('category_name') }}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category.id">
          <td>{{ category.id }}</td>
          <td>{{ category.title }}</td>
          <td class="text-center">
            <button @click="viewCategoryDetails(category)" class="btn btn-outline-info me-2" title="Voir les détails">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editCategory(category)" class="btn btn-outline-success me-2" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteCategory(category.id)" class="btn btn-outline-danger" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showCategoryDetails" class="category-details-overlay">
      <div class="category-details-modal">
        <div class="modal-header">
          <h5>{{ $t('category_detail') }}</h5>
          <button type="button" class="btn-close" @click="closeCategoryDetails"></button>
        </div>
        <div class="modal-body">
          <p><strong>ID:</strong> {{ selectedCategory.id }}</p>
          <p><strong>Nom:</strong> {{ selectedCategory.title }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeCategoryDetails">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';

const categoryStore = useCategoryStore();
const categories = ref([]);
const newCategory = ref({ title: '' });
const successMessage = ref('');
const errorMessage = ref('');
const isEditing = ref(false);
const editingCategoryId = ref(null);
const selectedCategory = ref({}); 
const showCategoryDetails = ref(false); 
const showForm = ref(false); 

const fetchCategories = async () => {
  await categoryStore.fetchCategories();
  // Trier les catégories par ID
  categories.value = categoryStore.categories.sort((a, b) => a.id - b.id);
};

const handleAddCategory = async () => {
  try {
    await categoryStore.addCategory(newCategory.value);
    successMessage.value = 'Catégorie ajoutée avec succès!';
    errorMessage.value = '';

    // Ajout de la nouvelle catégorie en haut du tableau
    categories.value.unshift(newCategory.value);

    resetForm();
    await fetchCategories();
    clearMessages();
    showForm.value = false; // Masquer le formulaire après l'ajout
  } catch (error) {
    errorMessage.value = 'Erreur lors de l\'ajout de la catégorie.';
    successMessage.value = '';
    clearMessages();
  }
};

const editCategory = (category) => {
  newCategory.value = { ...category };
  isEditing.value = true;
  editingCategoryId.value = category.id;
  showForm.value = true;
};

const handleUpdateCategory = async () => {
  try {
    await categoryStore.updateCategory(editingCategoryId.value, newCategory.value);
    successMessage.value = 'Catégorie modifiée avec succès!';
    errorMessage.value = '';
    resetForm();
    await fetchCategories();
    clearMessages();
    showForm.value = false;
  } catch (error) {
    errorMessage.value = 'Erreur lors de la mise à jour de la catégorie.';
    successMessage.value = '';
    clearMessages();
  }
};

const deleteCategory = async (categoryId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
    try {
      await categoryStore.deleteCategory(categoryId);
      successMessage.value = 'Catégorie supprimée avec succès!';
      errorMessage.value = '';
      await fetchCategories();
      clearMessages();
    } catch (error) {
      errorMessage.value = 'Erreur lors de la suppression de la catégorie.';
      successMessage.value = '';
      clearMessages();
    }
  }
};

const viewCategoryDetails = (category) => {
  selectedCategory.value = category; 
  showCategoryDetails.value = true; 
};

const closeCategoryDetails = () => {
  showCategoryDetails.value = false; 
};

const cancelEdit = () => {
  resetForm();
  isEditing.value = false; 
  showForm.value = false; 
};

const resetForm = () => {
  newCategory.value = { title: '' };
  errorMessage.value = '';
  successMessage.value = '';
};

const clearMessages = () => {
  setTimeout(() => {
    errorMessage.value = '';
    successMessage.value = '';
  }, 3000);
};

onMounted(fetchCategories);
</script>


<style scoped>
.category-details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-details-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.modal-header, .modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 10px 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.btn {
  margin-top: 20px; /* Augmente l'espace entre le bouton et les éléments autour */
}

.table {
  width: 60%;
  margin: auto;
}

</style>
