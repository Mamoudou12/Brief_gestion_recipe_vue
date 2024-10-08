<template>
  <div class="form-container">
    <h2>{{ $t('ajout_recette') }}</h2>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <form @submit.prevent="handleAddRecipe" class="recipe-form">
      <div class="form-group">
        <label for="title">{{ $t('titre') }} :</label>
        <input v-model="recipe.title" type="text" id="title" class="form-control" :placeholder="$t('enter_title')" required />
      </div>

      <div class="form-group">
        <label for="ingredients">{{ $t('ingredients') }}</label>
        <textarea v-model="recipe.ingredients" id="ingredients" class="form-control" :placeholder="$t('list_ingredient')" required></textarea>
      </div>

      <div class="form-group">
        <label for="type">{{ $t('type') }} :</label>
        <select v-model="recipe.type" id="type" class="form-control" required>
          <option value="" disabled>{{ $t('chose_type') }}</option>
          <option value="entrée">{{ $t('entrée') }}</option>
          <option value="plat">{{ $t('plat') }}</option>
          <option value="dessert">{{ $t('dessert') }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="category">{{ $t('category') }} :</label>
        <select v-model="recipe.id_categorie" id="category" class="form-control" required>
          <option value="" disabled>{{ $t('chose_category') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.title }} 
          </option>
        </select>
      </div>

      <button type="submit" class="btn btn-primary">{{ $t('add_recipe') }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRecipeStore } from '../stores/recipeStore';
import { useCategoryStore } from '../stores/categoryStore'; 
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const recipeStore = useRecipeStore();
const categoryStore = useCategoryStore(); 
const router = useRouter();

const recipe = ref({
  title: '',
  ingredients: '',
  type: '',
  id_categorie: '' // Utilisation de id_categorie ici
});

const successMessage = ref('');
const errorMessage = ref('');
const categories = ref([]); 

const fetchCategories = async () => {
  await categoryStore.fetchCategories();
  categories.value = categoryStore.categories;
};

const handleAddRecipe = async () => {
  if (recipe.value.title && recipe.value.ingredients && recipe.value.type && recipe.value.id_categorie) {
    const recipeToSubmit = { ...recipe.value };
    
    try {
      await recipeStore.addRecipe(recipeToSubmit);
      successMessage.value = t('recipe_added_success');
      errorMessage.value = '';

      setTimeout(() => {
        router.push({ name: 'recipe-list' });
      }, 1500);

      // Réinitialisation des champs après succès
      recipe.value = { title: '', ingredients: '', type: '', id_categorie: '' };
    } catch (error) {
      console.error
      if (error.response) {
        errorMessage.value = t('error_adding_recipe') + ' ' + (error.response.data.message || t('please_try_again'));
      } else {
        errorMessage.value = t('internal_error');
      }
    }
  } else {
    errorMessage.value = t('fill_required_fields');
  }
};

// Appel de la fonction pour récupérer les catégories à l'initialisation
onMounted(fetchCategories);
</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 30px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  font-family: 'Arial', sans-serif;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
  transition: border-color 0.3s ease-in-out;
}

.form-control:focus {
  border-color: #007bff;
  outline: none;
}

.btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.btn:hover {
  background-color: #0056b3;
}

.alert {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}
</style>
