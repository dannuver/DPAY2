// Netlify Function: PuntoRed Pay
// Endpoint: /api/puntored/pay

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { address, amount, memo } = JSON.parse(event.body);
    // Aquí iría la integración real con la API de PuntoRed
    // Ejemplo de llamada a la API externa:
    // const puntoredRes = await fetch('https://api.puntored.com/pay', {
    //   method: 'POST',
    //   headers: { 'Authorization': 'Bearer TU_API_KEY', 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ address, amount, memo })
    // });
    // const puntoredData = await puntoredRes.json();
    // Simulación de respuesta:
    const puntoredData = { status: 'approved', txid: '1234567890', memo };
    return {
      statusCode: 200,
      body: JSON.stringify(puntoredData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error procesando pago en PuntoRed', details: error.message })
    };
  }
};
