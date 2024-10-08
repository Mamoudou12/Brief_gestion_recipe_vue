<template>
  <div class="form-container">
    <h2>{{ $t("editRecipe") }}</h2>
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <form @submit.prevent="handleEditRecipe" class="recipe-form">
      <div class="form-group">
        <label for="title">{{ $t("title") }}</label>
        <input
          v-model="recipe.title"
          type="text"
          id="title"
          class="form-control"
          placeholder="title"
          required
        />
      </div>

      <div class="form-group">
        <label for="ingredients">{{ $t("ingredients") }}</label>
        <textarea
          v-model="recipe.ingredients"
          id="ingredients"
          class="form-control"
          rows="4"
          placeholder="ingredients"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="type">{{ $t("type") }}</label>
        <select v-model="recipe.type" id="type" class="form-control" required>
          <option value="" disabled>{{ $t('chose_type') }}</option>
          <option value="entrée">{{ $t('entrée') }}</option>
          <option value="plat">{{ $t('plat') }}</option>
          <option value="dessert">{{ $t('dessert') }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="category">{{ $t("category") }}</label>
        <select
          v-model="recipe.category"
          id="category"
          class="form-control"
          required
        >
          <option value="" disabled>Choisissez une catégorie</option>
          <option
            v-for="category in categories"
            :key="category.categorie_id"
            :value="category.title"
          >
            {{ category.title }}
          </option>
        </select>
      </div>

      <button type="submit" class="btn btn-primary">
        {{ $t("editButton") }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRecipeStore } from "../stores/recipeStore";
import { useCategoryStore } from "../stores/categoryStore";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const categoryStore = useCategoryStore();
const recipe = ref({
  id: null,
  title: "",
  ingredients: "",
  type: "",
  category: "",
});
const categories = ref([]);
const successMessage = ref("");
const errorMessage = ref("");

onMounted(async () => {
  try {
    await categoryStore.fetchCategories();
    categories.value = categoryStore.categories;
  } catch (error) {
    errorMessage.value = "Erreur lors du chargement des catégories.";
  }

  const recipeId = route.params.id;
  const existingRecipe = recipeStore.getRecipeById(Number(recipeId));

  if (existingRecipe) {
    recipe.value = { ...existingRecipe };
  } else {
    errorMessage.value = "Recette introuvable.";
  }
});

async function handleEditRecipe() {
  if (
    recipe.value.title &&
    recipe.value.ingredients &&
    recipe.value.type &&
    recipe.value.category
  ) {
    try {
      await recipeStore.updateRecipe(recipe.value);
      successMessage.value = "Recette mise à jour avec succès !";
      errorMessage.value = "";
      setTimeout(() => {
        router.push({ name: "recipe-list" });
      }, 2000);
    } catch (error) {
      errorMessage.value = "Erreur lors de la mise à jour de la recette.";
    }
  } else {
    errorMessage.value = "Veuillez remplir tous les champs obligatoires.";
  }
}
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
  font-family: "Arial", sans-serif;
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
