import { defineStore } from 'pinia'

export const useContractStore = defineStore('contractStore', {
  state: () => ({
    contracts: []
  }),
  actions: {
    addContract(contract) {
      this.contracts.push(contract)
    },
    getContractById(id) {
      return this.contracts.find(c => c.id === id)
    },
    deleteContract(id) {
      this.contracts = this.contracts.filter(c => c.id !== id)
    }
  }
})
