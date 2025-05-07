import css from '../style/note-list.css?raw';
import './loading-indicator.js';
import './confirm-dialog.js';
import * as NotesAPI from '../data/remote/notes-api.js';
import { animate, stagger } from 'animejs';

class NoteList extends HTMLElement {
  constructor() {
    super();
    this.notes = [];
    this.loading = true;
    this.handleNoteAdded = this.handleNoteAdded.bind(this);
  }

  connectedCallback() {
    this.loading = true;
    this.render();
    this.loadNotes();

    if (!this._eventAttached) {
      window.addEventListener('note-added', this.handleNoteAdded);
      window.addEventListener('search-notes', this.handleSearchNotes);
      this._eventAttached = true;
    }
  }

  disconnectedCallback() {
    window.removeEventListener('note-added', this.handleNoteAdded);
    this._eventAttached = false;
  }

  set isArchived(value) {
    if (this._isArchived === value) return;
    this._isArchived = value;
    this.loadNotes();
  }

  get isArchived() {
    return this._isArchived;
  }

  handleNoteAdded() {
    this.loadNotes();
  }

  handleSearchNotes = (event) => {
    const keyword = event.detail;
    this.render(keyword);
  };

  showConfirm(message) {
    return new Promise((resolve) => {
      const dialog = document.createElement('confirm-dialog');
      dialog.setAttribute('message', message);
      document.body.appendChild(dialog);
      dialog.addEventListener('confirm', (e) => {
        resolve(e.detail);
      });
    });
  }

  async loadNotes() {
    try {
      this.loading = true;
      this.render();

      const [notes] = await Promise.all([
        this.isArchived ? NotesAPI.getArchivedNotes() : NotesAPI.getActiveNotes(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
      this.notes = notes;
    } catch (error) {
      alert('Gagal mengambil catatan: ' + error.message);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  truncateTextByWords(text, wordLimit) {
    const words = text.trim().split(/\s+/);
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(' ') + '...'
      : text;
  }
  

  showModal(note) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.innerHTML = `
      <h2>${note.title}</h2>
      <small>${new Date(note.createdAt).toLocaleString()}</small>
      <p>${note.body}</p>
      <button id="close-modal">Tutup</button>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    animate(modal, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 400,
      easing: 'easeOutCubic',
    });

    backdrop.addEventListener('click', () => backdrop.remove());
    modal.addEventListener('click', (e) => e.stopPropagation());
    modal.querySelector('#close-modal').addEventListener('click', () => backdrop.remove());
  }

  render(keyword = '') {
    this.innerHTML = '';

    if (this.loading) {
      this.innerHTML = '<loading-indicator></loading-indicator>';
      return;
    }

    const filteredNotes = this.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(keyword) ||
        note.body.toLowerCase().includes(keyword)
    );

    if (filteredNotes.length === 0) {
      this.innerHTML = `
        <style>${css}</style>
        <p>Tidak ada catatan.</p>`;
      return;
    }

    this.innerHTML = `
      <style>${css}</style>
      <h2 class="judul">${this.isArchived ? 'Catatan Terarsip' : 'Catatan Aktif'}</h2>
      <div class="notes-container">
        ${filteredNotes.map((note) => `
          <div class="note-item" data-id="${note.id}">
            <h3 class="note-title">${this.truncateTextByWords(note.title, 5)}</h3>
            <p class="note-preview">${this.truncateTextByWords(note.body, 10)}</p>
            <small>${new Date(note.createdAt).toLocaleString()}</small>
            <div class="note-actions">
              <button data-id="${note.id}" class="delete-btn">Hapus</button>
              <button data-id="${note.id}" class="archive-btn">
                ${this.isArchived ? 'Kembalikan' : 'Arsipkan'}
              </button>
            </div>
          </div>`).join('')}
      </div>`;

    const noteItems = this.querySelectorAll('.note-item');
    animate(noteItems, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(100),
      duration: 600,
      easing: 'easeOutQuad',
    });

    this.querySelectorAll('.archive-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await this.archiveOrUnarchiveNote(id);
      });
    });

    this.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        await this.deleteNote(id);
      });
    });

    this.querySelectorAll('.note-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const note = this.notes.find((n) => n.id === id);
        if (note) this.showModal(note);
      });
    });
  }

  async archiveOrUnarchiveNote(id) {
    const message = this.isArchived
      ? 'Yakin ingin mengembalikan catatan ini?'
      : 'Yakin ingin mengarsipkan catatan ini?';

    const confirmed = await this.showConfirm(message);
    if (!confirmed) return;

    try {
      if (this.isArchived) {
        await NotesAPI.unarchiveNote(id);
        dialog.remove();
      } else {
        await NotesAPI.archiveNote(id);
        dialog.remove();
      }
    } catch (error) {
      alert('Gagal mengubah status arsip: ' + error.message);
    } finally {
      document.querySelector('confirm-dialog')?.remove();
      this.loadNotes();
    }
  }

  async deleteNote(id) {
    const confirmed = await this.showConfirm('Yakin ingin menghapus catatan ini?');
    if (!confirmed) return;

    try {
      await NotesAPI.deleteNote(id);
    } catch (error) {
      alert('Gagal menghapus catatan: ' + error.message);
    } finally {
      document.querySelector('confirm-dialog')?.remove();
      this.loadNotes();
    }
  }
}

customElements.define('note-list', NoteList);
