const contentElement = document.getElementById('content');
const copyMarkdownButton = document.getElementById('copy-markdown');
const copyStatus = document.getElementById('copy-status');

async function loadMarkdown() {
  try {
    const res = await fetch('content.md');
    if (!res.ok) throw new Error('Markdown を読み込めませんでした');
    const text = await res.text();
    renderMarkdown(text);
    setupCopyMarkdown(text);
  } catch (error) {
    contentElement.innerHTML = `<p class="error">読み込み時にエラーが発生しました: ${error.message}</p>`;
  }
}

function setupCopyMarkdown(text) {
  copyMarkdownButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      showCopyStatus('Markdown をコピーしました');
    } catch (err) {
      showCopyStatus('コピーできませんでした');
      console.error(err);
    }
  });
}

function showCopyStatus(message) {
  copyStatus.textContent = message;
  setTimeout(() => (copyStatus.textContent = ''), 3000);
}

function renderMarkdown(text) {
  const md = window.markdownit({
    html: false,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && window.hljs.getLanguage(lang)) {
        try {
          return `<pre><code class="hljs">${window.hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
        } catch (__) {}
      }
      return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
    },
  }).use(window.markdownItAnchor, {
    permalink: window.markdownItAnchor.permalink.ariaHidden({
      placement: 'before',
      class: 'anchor',
    }),
  });

  const defaultFence = md.renderer.rules.fence || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options, env);
  };

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = (token.info || '').trim().toLowerCase();
    const isPlantUml = info === 'plantuml' || token.content.includes('@startuml');

    if (isPlantUml) {
      const encoded = window.plantumlEncoder.encode(token.content);
      const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
      const escaped = md.utils.escapeHtml(token.content);
      return `
        <div class="uml-block">
          <div class="uml-toolbar">
            <button class="copy-code" data-content="${encodeURIComponent(token.content)}">Copy</button>
          </div>
          <pre class="uml-source"><code>${escaped}</code></pre>
          <div class="uml-preview">
            <img src="${url}" alt="PlantUML diagram" loading="lazy">
          </div>
        </div>
      `;
    }

    const rendered = defaultFence(tokens, idx, options, env, self);
    return `<div class="code-block">${rendered}<button class="copy-code" data-content="${encodeURIComponent(token.content)}">Copy</button></div>`;
  };

  const html = md.render(text);
  contentElement.innerHTML = html;
  attachCopyHandlers();
}

function attachCopyHandlers() {
  document.querySelectorAll('.copy-code').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const data = event.currentTarget.getAttribute('data-content');
      const decoded = decodeURIComponent(data);
      try {
        await navigator.clipboard.writeText(decoded);
        showCopyStatus('コピーしました');
      } catch (err) {
        console.error(err);
        showCopyStatus('コピーに失敗しました');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', loadMarkdown);
