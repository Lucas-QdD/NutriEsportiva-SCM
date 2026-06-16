import AsyncStorage from '@react-native-async-storage/async-storage';

// Em celular fisico via Expo, troque localhost pelo IP da maquina na mesma rede.
export const API_BASE_URL = 'http://localhost:3333';
const DEBUG_API = false;

export async function getStoredToken() {
  return AsyncStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = await getStoredToken();
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (DEBUG_API) {
    console.log('[API] Request', {
      method: options.method || 'GET',
      url,
      headers,
      body: options.body ? JSON.parse(options.body) : undefined,
    });
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error('Resposta invalida da API');
    }
  }

  if (DEBUG_API) {
    console.log('[API] Response', {
      url,
      status: response.status,
      ok: response.ok,
      data,
    });
  }

  if (!response.ok) {
    const error = new Error(data?.error || 'Erro na comunicacao com a API');
    error.status = response.status;
    error.data = data;
    console.warn('[API] Error', {
      url,
      status: response.status,
      data,
      message: error.message,
    });
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (path) =>
    request(path, {
      method: 'DELETE',
    }),
};
