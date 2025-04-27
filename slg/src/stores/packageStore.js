import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from '@/composables/Toast/useToast';

export const usePackageStore = defineStore('packages', () => {
  // État
  const packages = ref([]);
  const isLoading = ref(false);
  const toast = useToast();

  // Actions
  async function loadPackages() {
    try {
      isLoading.value = true;
      const storedPackages = localStorage.getItem('slc_packages');
      
      if (storedPackages) {
        const parsedPackages = JSON.parse(storedPackages);
        
        // Convertir les packages du format stocké au format interne
        packages.value = parsedPackages.map(pkg => {
          // Convertir les fonctions de l'objet au tableau
          const functionsArray = [];
          if (pkg.functions && typeof pkg.functions === 'object') {
            for (const [funcId, funcDetails] of Object.entries(pkg.functions)) {
              functionsArray.push({
                id: funcId,
                name: funcId,
                label: funcDetails.label || funcId,
                description: funcDetails.description || '',
                code: funcDetails.code || '',
                default: funcDetails.default || false
              });
            }
          }
          
          return {
            id: pkg.name,
            name: pkg.name,
            label: pkg.label,
            description: pkg.description,
            functions: functionsArray,
            variables: pkg.variables || [],
            structs: pkg.structs || []
          };
        });
      }
      
      // Si aucun package n'existe, ajouter un exemple
      if (packages.value.length === 0) {
        await createDefaultPackage();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des packages:', error);
      toast.error('Erreur lors du chargement des packages');
    } finally {
      isLoading.value = false;
    }
  }

  async function createDefaultPackage() {
    const defaultPackage = {
      name: "payment_service",
      label: "Service de Paiement",
      description: "Gère les opérations de paiement et de vérification financière dans les contrats intelligents.",
      functions: {
        "process_payment": {
          code: "function processPayment(address _from, address _to, uint256 _amount) public {\n  require(_amount > 0, \"Le montant doit être supérieur à zéro\");\n  // Logique de traitement du paiement\n}",
          default: true,
          label: "Traiter Paiement",
          description: "Traite un paiement entre deux parties."
        }
      },
      structs: [
        {
          name: "Payment",
          code: "struct Payment {\n  address sender;\n  address receiver;\n  uint256 amount;\n  uint256 timestamp;\n  bool completed;\n}"
        }
      ],
      variables: [
        {
          name: "paymentStatus",
          code: "mapping(address => bool) public paymentStatus;"
        }
      ]
    };
    
    // Convertir au format interne
    packages.value = [{
      id: defaultPackage.name,
      name: defaultPackage.name,
      label: defaultPackage.label,
      description: defaultPackage.description,
      functions: Object.entries(defaultPackage.functions).map(([id, func]) => ({
        id,
        name: id,
        label: func.label,
        description: func.description,
        code: func.code,
        default: func.default
      })),
      variables: defaultPackage.variables,
      structs: defaultPackage.structs
    }];
    
    // Enregistrer dans localStorage
    await saveToStorage();
  }

  async function saveToStorage() {
    try {
      // Convertir les packages du format interne au format de stockage
      const packagesToStore = packages.value.map(pkg => {
        const functions = {};
        pkg.functions.forEach(func => {
          functions[func.id] = {
            code: func.code,
            default: func.default,
            label: func.label,
            description: func.description
          };
        });
        
        return {
          name: pkg.name,
          label: pkg.label,
          description: pkg.description,
          functions,
          variables: pkg.variables,
          structs: pkg.structs
        };
      });
      
      localStorage.setItem('slc_packages', JSON.stringify(packagesToStore));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des packages:', error);
      toast.error('Erreur lors de la sauvegarde des packages');
      return false;
    }
  }

  function getPackageById(id) {
    return packages.value.find(pkg => pkg.id === id);
  }

  async function savePackage(packageData) {
    try {
      const index = packages.value.findIndex(pkg => pkg.id === packageData.id);
      
      if (index === -1) {
        // Nouveau package
        packages.value.push(packageData);
        toast.success('Package créé avec succès');
      } else {
        // Mise à jour
        packages.value[index] = packageData;
        toast.success('Package mis à jour avec succès');
      }
      
      await saveToStorage();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du package:', error);
      toast.error('Erreur lors de la sauvegarde du package');
      return false;
    }
  }

  async function deletePackage(id) {
    try {
      packages.value = packages.value.filter(pkg => pkg.id !== id);
      await saveToStorage();
      toast.success('Package supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du package:', error);
      toast.error('Erreur lors de la suppression du package');
      return false;
    }
  }

  function exportPackage(pkg) {
    try {
      // Créer une copie du package pour la transformation
      const exportData = {
        name: pkg.name,
        label: pkg.label,
        description: pkg.description,
        functions: {},  // Objet au lieu d'un tableau
        structs: pkg.structs,
        variables: pkg.variables
      };
      
      // Transformer le tableau de fonctions en objet
      pkg.functions.forEach(func => {
        // Utiliser l'ID de la fonction comme clé dans l'objet
        exportData.functions[func.id] = {
          code: func.code,
          default: func.default,
          label: func.label,
          description: func.description
        };
      });
      
      // Créer un blob avec le contenu JSON
      const content = JSON.stringify(exportData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      
      // Créer un lien pour télécharger le fichier
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pkg.id}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`Package "${pkg.label}" exporté avec succès`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'exportation du package:', error);
      toast.error('Erreur lors de l\'exportation du package');
      return false;
    }
  }

  async function importPackage(file) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            // Lire le contenu JSON du fichier
            const content = event.target.result;
            const importedData = JSON.parse(content);
            
            // Créer une structure pour le package interne
            const internalPackage = {
              id: importedData.name || '',
              name: importedData.name || '',
              label: importedData.label || '',
              description: importedData.description || '',
              functions: [],  // Tableau vide pour les fonctions
              variables: Array.isArray(importedData.variables) ? importedData.variables : [],
              structs: Array.isArray(importedData.structs) ? importedData.structs : []
            };
            
            // Convertir l'objet de fonctions en tableau
            if (importedData.functions && typeof importedData.functions === 'object') {
              for (const [funcId, funcDetails] of Object.entries(importedData.functions)) {
                internalPackage.functions.push({
                  id: funcId,
                  name: funcId,  // Utiliser l'ID comme nom par défaut
                  label: funcDetails.label || funcId,
                  description: funcDetails.description || '',
                  code: funcDetails.code || '',
                  default: funcDetails.default || false
                });
              }
            }
            
            // Vérifier si un package avec le même ID existe déjà
            const existingIndex = packages.value.findIndex(p => p.id === internalPackage.id);
            
            if (existingIndex !== -1) {
              // Remplacer le package existant
              packages.value[existingIndex] = internalPackage;
              toast.warning(`Le package "${internalPackage.label}" a été mis à jour`);
            } else {
              // Ajouter le nouveau package
              packages.value.push(internalPackage);
              toast.success(`Le package "${internalPackage.label}" a été importé`);
            }
            
            // Enregistrer les changements
            await saveToStorage();
            
            resolve(internalPackage);
          } catch (error) {
            console.error('Erreur lors du parsing du fichier JSON:', error);
            toast.error('Format de fichier invalide. Veuillez sélectionner un fichier JSON valide.');
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          toast.error('Erreur lors de la lecture du fichier');
          reject(error);
        };
        
        // Lire le fichier comme texte
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Erreur lors de l\'import du package:', error);
      toast.error(`Erreur lors de l'import: ${error.message}`);
      throw error;
    }
  }

  return {
    packages,
    isLoading,
    loadPackages,
    getPackageById,
    savePackage,
    deletePackage,
    exportPackage,
    importPackage
  };
});