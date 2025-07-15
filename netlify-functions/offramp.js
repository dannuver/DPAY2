// Netlify Function: Detecta eventos OffRampRequested y llama a la API de PuntoRed
exports.handler = async function(event, context) {
  // TODO: Escuchar evento de Soroban y llamar a PuntoRed
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Función backend lista.' })
  };
};
