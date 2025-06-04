export const ContractStatus = Object.freeze({
  DRAFT: 'draft',
  DEPLOYED: 'deployed',
  COMPLETED: 'completed'  
});

export const ContractStatusLabels = [
  { label: 'Brouillon', value: ContractStatus.DRAFT },
  { label: 'Déployé', value: ContractStatus.DEPLOYED },
  { label: 'Terminé', value: ContractStatus.COMPLETED } 
];