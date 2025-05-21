import metadata from '@/assets/packageMetadata.json';

export function enrichApiResponse(apiResponse) {
  return apiResponse.map(p => {
    const meta = metadata[p.name] || {};
    return {
      ...p,
      id: meta.id || p.name,
      label: meta.label || p.name,
      description: meta.description || "",
      functions: p.functions.map(fn => {
        const fnMeta = meta.functions?.[fn.name] || {};
        return {
          ...fn,
          id: fnMeta.id || fn.name,
          label: fnMeta.label || fn.name,
          description: fnMeta.description || ""
        };
      })
    };
  });
}


export function cleanApiResponse(apiResponse) {
    return apiResponse.map(p => {
      return {
        name: p.name,
        description: p.description,
        functions: p.functions.map(fn => {
          return{
            name:fn.name,
            label:fn.label
          }
        })
      };
    });
  }
  

  


