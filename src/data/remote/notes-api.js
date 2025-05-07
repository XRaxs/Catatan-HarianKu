const BASE_URL = 'https://notes-api.dicoding.dev/v2';

export async function getActiveNotes() {
  const response = await fetch(`${BASE_URL}/notes`);
  const responseJson = await response.json();
  if (responseJson.status !== 'success') {
    throw new Error(responseJson.message);
  }
  return responseJson.data;
}

export async function getArchivedNotes() {
  const response = await fetch(`${BASE_URL}/notes/archived`);
  const responseJson = await response.json();
  if (responseJson.status !== 'success') {
    throw new Error(responseJson.message);
  }
  return responseJson.data;
}

export async function getNotes() {
  const response = await fetch(`${BASE_URL}/notes`);
  const result = await response.json();
  if (result.status !== 'success') throw new Error(result.message);
  return result.data;
}

export async function createNote({ title, body }) {
  const response = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body }),
  });
  const result = await response.json();
  if (result.status !== 'success') throw new Error(result.message);
  return result.data;
}

export async function deleteNote(id) {
  const response = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await response.json();
  if (result.status !== 'success') throw new Error(result.message);
  return true;
}

export async function archiveNote(id) {
  const response = await fetch(`${BASE_URL}/notes/${id}/archive`, {
    method: 'POST',
  });
  const responseJson = await response.json();
  if (responseJson.status !== 'success') {
    throw new Error(responseJson.message);
  }
  return responseJson;
}

export async function unarchiveNote(id) {
  const response = await fetch(`${BASE_URL}/notes/${id}/unarchive`, {
    method: 'POST',
  });
  const responseJson = await response.json();
  if (responseJson.status !== 'success') {
    throw new Error(responseJson.message);
  }
  return responseJson;
}

export default {
  getNotes,
  createNote,
  deleteNote,
};
