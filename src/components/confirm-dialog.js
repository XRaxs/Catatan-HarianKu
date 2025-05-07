import { animate } from 'animejs';
import css from '../style/note-list.css?raw';
import './loading-indicator.js';

class ConfirmDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const message = this.getAttribute('message') || 'Apakah Anda yakin?';

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="backdrop">
        <div class="dialog">
          <div class="dialog-content">
            <p class="message-text">${message}</p>
            <div class="actions">
              <button class="yes">Ya</button>
              <button class="no">Batal</button>
            </div>
          </div>
          <div class="loading" style="display: none; text-align: center; margin-top: 1rem;">
            <loading-indicator></loading-indicator>
            <p style="margin-top: 0.5rem;">Please wait...</p>
          </div>
        </div>
      </div>
    `;

    const dialog = this.shadowRoot.querySelector('.dialog');
    const yesBtn = this.shadowRoot.querySelector('.yes');
    const noBtn = this.shadowRoot.querySelector('.no');
    const loadingDiv = this.shadowRoot.querySelector('.loading');
    const dialogContent = this.shadowRoot.querySelector('.dialog-content');

    animate(dialog, {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 300,
      easing: 'easeOutCubic',
    });

    yesBtn.addEventListener('click', () => {
      yesBtn.disabled = true;
      noBtn.disabled = true;
      dialogContent.style.display = 'none';
      loadingDiv.style.display = 'block';

      // Hanya kirim event, biarkan parent (note-list) yang remove dialog nanti
      this.dispatchEvent(new CustomEvent('confirm', { detail: true }));
    });

    noBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('confirm', { detail: false }));
      this.closeDialog(dialog);
    });

    this.shadowRoot.querySelector('.backdrop').addEventListener('click', (e) => {
      if (e.target.classList.contains('backdrop')) {
        this.dispatchEvent(new CustomEvent('confirm', { detail: false }));
        this.closeDialog(dialog);
      }
    });
  }

  closeDialog(dialog) {
    animate(dialog, {
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: 250,
      easing: 'easeInCubic',
      complete: () => this.remove()
    });
  }
}

customElements.define('confirm-dialog', ConfirmDialog);
