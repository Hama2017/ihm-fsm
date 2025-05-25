export function removeProperties(apiResponse, propsToRemove = []) {
    return apiResponse.map(p => {
      const cleanedService = { ...p };
      for (const prop of propsToRemove) {
        delete cleanedService[prop];
      }
      return cleanedService;
    });
  }
  