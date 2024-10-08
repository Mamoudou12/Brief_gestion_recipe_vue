// store/category.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [], 
    apiUrl: 'http://localhost:4000/api/categories', 
  }),
  actions: {
    // Récupérer toutes les catégories
    async fetchCategories() {
      try {
        const response = await axios.get(this.apiUrl);
        this.categories = response.data; 
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    },

    // Ajouter une nouvelle catégorie
    async addCategory(category) { 
      try {
        const response = await axios.post(this.apiUrl, { title: category.title }); 
        this.categories.push(response.data); 
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la catégorie:', error);
      }
    },

    // Supprimer une catégorie par ID
    async deleteCategory(id) {
      try {
        await axios.delete(`${this.apiUrl}/${id}`);
        // Utiliser 'id' qui correspond à la structure de votre table
        this.categories = this.categories.filter(category => category.id !== id); 
      } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error);
      }
    },

    // Mettre à jour une catégorie
    async updateCategory(id, newCategory) {
      try {
        const response = await axios.put(`${this.apiUrl}/${id}`, { title: newCategory.title });
        const categoryIndex = this.categories.findIndex(category => category.id === id); 
        if (categoryIndex !== -1) {
          this.categories[categoryIndex] = response.data; // Mettre à jour la catégorie localement
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la catégorie:', error);
      }
    }
  },
});
