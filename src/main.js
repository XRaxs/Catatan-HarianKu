import './components/note-form.js';
import './components/note-list.js';
import './components/note-search.js';
import './style/style.css';

import {
  getActiveNotes,
  getArchivedNotes,
  archiveNote,
  unarchiveNote,
  createNote,
  deleteNote,
} from './data/remote/notes-api.js';

const noteList = document.querySelector('note-list');
const formElement = document.querySelector('note-form');
const searchElement = document.querySelector('note-search');

const btnShowActive = document.getElementById('show-active');
const btnShowArchived = document.getElementById('show-archived');

let notes = [];
let showingArchived = false;
noteList.isArchived = false;

function updateNoteList(filteredNotes = null) {
  noteList.notes = filteredNotes || notes;
}

async function loadNotes() {
  try {
    noteList.loading = true;
    notes = showingArchived ? await getArchivedNotes() : await getActiveNotes();
    updateNoteList();
  } catch (error) {
    alert(`Gagal memuat catatan: ${error.message}`);
  } finally {
    noteList.loading = false;
  }
}

formElement.addEventListener('note-added', async (event) => {
  try {
    const newNote = await createNote(event.detail);
    if (!showingArchived) {
      notes.unshift(newNote);
      updateNoteList();
    }
  } catch (error) {
    alert(`Gagal menambahkan catatan: ${error.message}`);
  }
});

noteList.addEventListener('note-deleted', async (event) => {
  try {
    await deleteNote(event.detail);
    notes = notes.filter((note) => note.id !== event.detail);
    updateNoteList();
  } catch (error) {
    alert(`Gagal menghapus catatan: ${error.message}`);
  }
});

noteList.addEventListener('note-archived', async (event) => {
  try {
    const id = event.detail;
    if (showingArchived) {
      await unarchiveNote(id);
    } else {
      await archiveNote(id);
    }
    notes = notes.filter((note) => note.id !== id);
    updateNoteList();
  } catch (error) {
    alert(`Gagal mengubah status arsip: ${error.message}`);
  }
});

searchElement.addEventListener('search-notes', (event) => {
  const keyword = event.detail.toLowerCase();
  const filtered = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(keyword) ||
      note.body.toLowerCase().includes(keyword)
  );
  updateNoteList(filtered);
});

btnShowActive.addEventListener('click', () => {
  showingArchived = false;
  noteList.isArchived = false;
  loadNotes();
});

btnShowArchived.addEventListener('click', () => {
  showingArchived = true;
  noteList.isArchived = true;
  loadNotes();
});

loadNotes();
