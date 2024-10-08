<template>
  <div class="container mt-5">
    <h2 class="text-primary mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        fill="currentColor"
        class="bi bi-list"
        viewBox="0 0 16 16"
      >
        <path
          d="M3.5 8a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm-9-4a.5.5 0 0 1-.5-.5V1a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V1a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zm4.5 0a.5.5 0 0 1-.5-.5V1a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-.5.5zM1 5.5A.5.5 0 0 1 1.5 5h13a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5v-.5zM1 10.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5v-.5z"
        />
      </svg>
      {{ $t("recipe_list_title") }}
    </h2>
    <div v-if="successMessage" class="mt-4 alert alert-success">
      {{ successMessage }}
    </div>
    <router-link to="/add-recipe" class="btn btn-primary mb-3">
      <i class="bi bi-plus-circle"></i> {{ $t("add_recipe") }}
    </router-link>

    <input
      type="text"
      v-model="searchQuery"
      :placeholder="$t('search_recipe')"
      class="form-control mb-4 search-input"
    />

    <div v-if="loading" class="alert alert-info">{{ $t("charge_recip") }}</div>

    <table
      class="table table-bordered"
      v-if="!loading && filteredRecipes.length"
    >
      <thead>
        <tr>
          <th>{{ $t("title") }}</th>
          <th>{{ $t("ingredients") }}</th>
          <th>{{ $t("type") }}</th>
          <th>Catégorie</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="recipe in filteredRecipes" :key="recipe.id">
          <td>{{ recipe.title }}</td>
          <td>{{ recipe.ingredients }}</td>
          <td>{{ recipe.type }}</td>
          <td>{{ getCategoryTitle(recipe.id_categorie) }}</td>
          <td>
            <router-link
              :to="{ name: 'recipe-details', params: { id: recipe.id } }"
              class="btn btn-outline-info me-2"
              title="Voir"
            >
              <i class="fas fa-eye"></i>
            </router-link>

            <router-link
              :to="{ name: 'edit-recipe', params: { id: recipe.id } }"
              class="btn btn-outline-success me-2"
              title="Modifier"
            >
              <i class="fas fa-edit"></i>
            </router-link>

            <button
              @click="handleDeleteRecipe(recipe.id)"
              class="btn btn-outline-danger"
              title="Supprimer"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && !filteredRecipes.length" class="alert alert-warning">
      Aucune recette ne correspond à votre recherche.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecipeStore } from "../stores/recipeStore";
import { useCategoryStore } from "../stores/categoryStore";

const recipeStore = useRecipeStore();
const categoryStore = useCategoryStore();
const searchQuery = ref("");
const successMessage = ref("");
const loading = ref(true);

onMounted(async () => {
  await recipeStore.loadRecipesFromApi();
  await categoryStore.fetchCategories();
  loading.value = false;
});

const recipes = computed(() => recipeStore.recipes);
const categories = computed(() => categoryStore.categories);

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const getCategoryTitle = (categoryId) => {
  const category = categories.value.find((cat) => cat.id === categoryId);
  return category ? category.title : "Catégorie inconnue";
};

const handleDeleteRecipe = async (id) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
    try {
      await recipeStore.deleteRecipe(id);
      successMessage.value = "Recette supprimée avec succès";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression de la recette.");
    }
  }
};
</script>

<style>
.search-input {
  max-width: 300px;
}
</style>
