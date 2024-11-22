//const njs_drainage_url = 'https://njs-drainage.ueredeveloper.repl.co';
const njs_drainage_url = 'https://njs-drainage-ueredeveloper.replit.app'

async function findByColumn(searchQuery) {

  const urlWithParams = `${njs_drainage_url}/findAllPoints?searchQuery=${searchQuery}`;

  try {
    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // obter primeiro índice da matriz
    return data[0];
  } catch (error) {
    console.error(error);
  }
}

export { findByColumn };
