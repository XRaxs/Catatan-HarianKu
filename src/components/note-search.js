import css from '../style/style.css?raw';

class NoteSearch extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <style>${css}</style>
            <div class="search-container">
                <input
                    type="text"
                    id="search-input"
                    placeholder="Cari catatan..."
                />
                <button id="search-toggle" title="Cari catatan">
                    🔍
                </button>
            </div>
        `;

    const toggleBtn = this.querySelector('#search-toggle');
    const searchInput = this.querySelector('#search-input');

    toggleBtn.addEventListener('click', () => {
      searchInput.classList.toggle('show');
      if (searchInput.classList.contains('show')) {
        searchInput.focus();
      } else {
        searchInput.value = '';
        this.dispatchEvent(
          new CustomEvent('search-notes', {
            detail: '',
            bubbles: true,
          })
        );
      }
    });

    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      this.dispatchEvent(
        new CustomEvent('search-notes', {
          detail: keyword,
          bubbles: true,
        })
      );
    });
  }
}

customElements.define('note-search', NoteSearch);
