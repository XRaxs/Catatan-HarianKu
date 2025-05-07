import css from '../style/note-form.css?raw';
import * as NotesAPI from '../data/remote/notes-api.js';
import { animate } from 'animejs';

class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this.shadowRoot.innerHTML = `
            <style>${css}</style>
            <button id="addNoteBtn">+</button>
            <div class="note-modal" id="modalWrapper">
                <form id="noteForm">
                    <input type="text" id="title" placeholder="Judul" required />
                    <span class="error-msg" id="titleError"></span>
                    <textarea id="body" placeholder="Isi catatan" required></textarea>
                    <span class="error-msg" id="bodyError"></span>
                    <button type="submit">Tambah</button>
                    <div class="loading-spinner" id="loadingSpinner" style="display: none;"></div>
                </form>
            </div>
        `;

    this.initEvents();
  }

  initEvents() {
    const shadow = this.shadowRoot;
    const addNoteBtn = shadow.querySelector('#addNoteBtn');
    const modalWrapper = shadow.querySelector('#modalWrapper');
    const noteForm = shadow.querySelector('#noteForm');
    const titleInput = shadow.querySelector('#title');
    const bodyInput = shadow.querySelector('#body');
    const titleError = shadow.querySelector('#titleError');
    const bodyError = shadow.querySelector('#bodyError');
    const submitBtn = shadow.querySelector('button[type="submit"]');
    const loadingSpinner = shadow.querySelector('#loadingSpinner');


    addNoteBtn.addEventListener('click', () => {
      modalWrapper.classList.add('active');
      const formEl = this.shadowRoot.querySelector('#noteForm');
      animate(formEl, {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        easing: 'easeOutCubic',
      });
    });

    modalWrapper.addEventListener('click', (e) => {
      if (e.target === modalWrapper) {
        const formEl = this.shadowRoot.querySelector('#noteForm');
        animate(formEl, {
          opacity: [1, 0],
          scale: [1, 0.9],
          duration: 400,
          easing: 'easeInCubic',
          complete: () => {
            modalWrapper.classList.remove('active');
          },
        });
      }
    });

    titleInput.addEventListener('input', () => {
      const valid = titleInput.value.trim() !== '';
      titleInput.classList.toggle('invalid', !valid);
      titleError.textContent = valid ? '' : 'Judul tidak boleh kosong.';
    });

    bodyInput.addEventListener('input', () => {
      const valid = bodyInput.value.trim() !== '';
      bodyInput.classList.toggle('invalid', !valid);
      bodyError.textContent = valid ? '' : 'Isi catatan tidak boleh kosong.';
    });

    noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();
      let isValid = true;

      if (!title) {
        titleInput.classList.add('invalid');
        titleError.textContent = 'Judul tidak boleh kosong.';
        isValid = false;
      }

      if (!body) {
        bodyInput.classList.add('invalid');
        bodyError.textContent = 'Isi catatan tidak boleh kosong.';
        isValid = false;
      }

      if (isValid) {
        submitBtn.disabled = true;
        loadingSpinner.style.display = 'block';
        const newNote = {
          id: +new Date(),
          title,
          body,
          createdAt: new Date().toISOString(),
          archived: false,
        };

        try {
          await NotesAPI.createNote(newNote);

          window.dispatchEvent(
            new CustomEvent('note-added', {
              detail: newNote,
            })
          );

          noteForm.reset();
          titleInput.classList.remove('invalid');
          bodyInput.classList.remove('invalid');
          titleError.textContent = '';
          bodyError.textContent = '';
          const formEl = this.shadowRoot.querySelector('#noteForm');
          animate(formEl, {
            opacity: [1, 0],
            scale: [1, 0.9],
            duration: 400,
            easing: 'easeInCubic',
            complete: () => {
              modalWrapper.classList.remove('active');
              submitBtn.disabled = false;
              loadingSpinner.style.display = 'none';
            },
          });
        } catch (error) {
          console.error('Gagal menambahkan catatan:', error);
          submitBtn.disabled = false;
          loadingSpinner.style.display = 'none';
        }
      }
    });
  }
}

customElements.define('note-form', NoteForm);
