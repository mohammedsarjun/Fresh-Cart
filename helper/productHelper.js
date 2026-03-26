/**
 * Sorts product varietyDetails by varietyMeasurement in ascending order.
 * @param {Array} products Array of product objects.
 * @returns {Array} Array of products with sorted varietyDetails.
 */
function sortProductVarieties(products) {
  if (!Array.isArray(products)) {
    return _sortSingle(products);
  }
  return products.map(_sortSingle);
}

function _sortSingle(product) {
  if (!product) return product;
  
  // Sort varietyDetails in-place if they exist
  if (product.varietyDetails && Array.isArray(product.varietyDetails)) {
    product.varietyDetails.sort((a, b) => {
      const valA = parseFloat(a.varietyMeasurement) || 0;
      const valB = parseFloat(b.varietyMeasurement) || 0;
      return valA - valB;
    });
  }
  
  return product;
}


module.exports = { sortProductVarieties };
