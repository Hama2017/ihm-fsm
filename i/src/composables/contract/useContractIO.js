import { useContractStore } from '@/stores/contractStore';

/**
 * Sérialise un contrat en JSON (format .slc)
 * @param {Object} contract - Le contrat à transformer
 * @returns {string} - JSON string
 */
function serializeContract(contract) {
  return JSON.stringify(contract, null, 2);
}

/**
 * Désérialise un fichier .slc en objet JS
 * @param {string} jsonString
 * @returns {Object|null}
 */
function deserializeContract(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Erreur de lecture du fichier .slc', error);
    return null;
  }
}

/**
 * Télécharge un contrat en tant que fichier .slc
 * @param {Object} contract
 * @param {string} [filename='contract.slc']
 */
function downloadContractAsSlc(contract, filename = 'contract.slc') {
  const blob = new Blob([serializeContract(contract)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Charge un contrat depuis un fichier .slc
 * @param {File} file - Le fichier sélectionné par l'utilisateur
 * @param {Function} onLoaded - Callback appelé avec le contrat
 */
function loadContractFromFile(file, onLoaded) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target.result;
    const contract = deserializeContract(content);
    if (contract) onLoaded(contract);
  };
  reader.readAsText(file);
}

/**
 * Sauvegarde un contrat dans le store Pinia
 * @param {Object} contract
 */
function saveContractToPinia(contract) {
    const contractStore = useContractStore();
  
    // Mettre comme contrat courant
    contractStore.setCurrentContract(contract);
  
    // Ajouter à la liste s’il n’existe pas déjà (évite les doublons)
    const existing = contractStore.getContractById(contract.id);
    if (!existing) {
      contractStore.addContract(contract);
    }
  }

/**
 * Simule une sauvegarde vers une API ou une base de données
 * @param {Object} contract
 */
async function saveContractToAPI(contract) {
  try {
    const response = await fetch('/api/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: serializeContract(contract)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la sauvegarde du contrat');
    }

    console.log('Contrat sauvegardé via API');
  } catch (err) {
    console.error(err);
  }
}

export {
  serializeContract,
  deserializeContract,
  downloadContractAsSlc,
  loadContractFromFile,
  saveContractToPinia,
  saveContractToAPI
};
