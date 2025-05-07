import css from '../style/note-list.css?raw';

class LoadingIndicator extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <style>${css}</style>
            <div class="spinner"></div>
        `;
  }
}

customElements.define('loading-indicator', LoadingIndicator);
