(() => {
  const $ = (s) => document.querySelector(s);
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const CHAVE = "ravyn-sacola";

  let sacola = carregar();
  let filtro = "Todos";
  const tamanhoEscolhido = {}; // id do produto -> tamanho

  // ---------- Persistência ----------
  function carregar() {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { return []; }
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch {}
  }

  // ---------- Imagem ----------
  function foto(p) {
    if (p.imagem) return `<img src="${p.imagem}" alt="${p.nome}" loading="lazy" />`;
    // Imagem provisória: silhueta da peça na cor do produto
    const formas = {
      Camisetas: '<path d="M30 18 44 12c2 5 10 8 16 8s14-3 16-8l14 6 12 18-14 8-4-4v58H36V40l-4 4-14-8Z"/>',
      Moletons: '<path d="M44 14c4-4 10-6 16-6s12 2 16 6l14 6 12 22-12 6-4-4v52H34V44l-4 4-12-6 12-22Z"/><path d="M48 76h24v14H48Z" fill="rgba(0,0,0,.25)"/>',
      Bermudas: '<path d="M30 30h60l8 56H68L60 54l-8 32H22Z"/>',
      "Calças": '<path d="M38 10h44l6 100H66L60 46l-6 64H32Z"/>',
      "Bonés": '<path d="M26 72c0-24 15-40 34-40s34 16 34 40Z"/><path d="M60 72h44c0 6-6 10-14 10H60Z"/>',
      "Acessórios": '<path d="M30 44h60l-6 52H36Z"/><path d="M46 44c0-10 6-16 14-16s14 6 14 16" fill="none" stroke="'+p.tom+'" stroke-width="5"/>',
    };
    const forma = formas[p.categoria] || formas.Camisetas;
    return `<div class="placeholder" data-tag="${p.marca || "Ravyn"}" style="background:#161616">
      <svg viewBox="0 0 120 120" fill="${p.tom}" stroke="rgba(255,255,255,.18)" stroke-width="1" aria-label="${p.nome}">${forma}</svg>
    </div>`;
  }

  // ---------- Filtros ----------
  const categorias = () => [...new Set(PRODUTOS.map((p) => p.categoria))];
  function renderFiltros() {
    const cats = ["Todos", ...categorias()];
    $("#filtros").innerHTML = cats
      .map((c) => `<button class="filtro ${c === filtro ? "ativo" : ""}" role="tab" aria-selected="${c === filtro}" data-cat="${c}">${c}</button>`)
      .join("");
  }

  // ---------- Catálogo ----------
  function renderCatalogo() {
    if (LOJA.emBreve) {
      $("#filtros").style.display = "none";
      $("#grade").outerHTML = `<div class="em-breve"><strong>Drop chegando em breve</strong>
        <p>As primeiras peças estão a caminho. Segue a gente no Instagram pra não perder o lançamento.</p>
        <a class="btn btn-neon" href="${LOJA.instagram || "#"}" target="_blank" rel="noopener">Seguir no Instagram</a></div>`;
      return;
    }
    const lista = filtro === "Todos" ? PRODUTOS : PRODUTOS.filter((p) => p.categoria === filtro);
    $("#grade").innerHTML = lista
      .map((p) => {
        if (p.tamanhos.length === 1) tamanhoEscolhido[p.id] = p.tamanhos[0];
        return `
        <article class="card">
          <div class="card-foto">${foto(p)}${p.selo ? `<span class="adesivo">${p.selo}</span>` : ""}</div>
          <div class="card-info">
            ${p.marca ? `<span class="card-marca">${p.marca}</span>` : ""}
            <h3 class="card-nome">${p.nome}</h3>
            <span class="card-preco">${brl(p.preco)}</span>
            ${LOJA.parcelas > 1 ? `<span class="card-parc">ou ${LOJA.parcelas}x de ${brl(p.preco / LOJA.parcelas)}</span>` : ""}
            <div class="tamanhos" role="radiogroup" aria-label="Tamanho">
              ${p.tamanhos
                .map((t) => `<button class="tam ${tamanhoEscolhido[p.id] === t ? "ativo" : ""}" data-id="${p.id}" data-tam="${t}" role="radio" aria-checked="${tamanhoEscolhido[p.id] === t}">${t}</button>`)
                .join("")}
            </div>
            <button class="btn-add" data-add="${p.id}">Adicionar à sacola</button>
          </div>
        </article>`;
      })
      .join("");
  }

  // ---------- Sacola ----------
  function renderSacola() {
    const qtdTotal = sacola.reduce((s, i) => s + i.qtd, 0);
    const cont = $("#contador");
    cont.textContent = qtdTotal;
    cont.style.visibility = qtdTotal ? "visible" : "hidden";

    if (!sacola.length) {
      $("#itens").innerHTML = '<p class="vazio"><strong>Tá vazia!</strong>Bora escolher umas peças.</p>';
      $("#sacolaRodape").hidden = true;
      return;
    }
    $("#sacolaRodape").hidden = false;
    $("#itens").innerHTML = sacola
      .map((i, idx) => {
        const p = PRODUTOS.find((x) => x.id === i.id);
        if (!p) return "";
        return `
        <div class="item">
          <div class="item-foto">${foto(p)}</div>
          <div>
            <div class="item-nome">${p.nome}</div>
            <div class="item-det">Tam. ${i.tam} · ${brl(p.preco)}</div>
            <div class="qtd">
              <button data-menos="${idx}" aria-label="Diminuir">−</button>
              <span>${i.qtd}</span>
              <button data-mais="${idx}" aria-label="Aumentar">+</button>
            </div>
          </div>
          <div class="item-dir">
            <span class="item-preco">${brl(p.preco * i.qtd)}</span>
            <button class="remover" data-remover="${idx}">Remover</button>
          </div>
        </div>`;
      })
      .join("");
    $("#total").textContent = brl(total());
  }

  const total = () =>
    sacola.reduce((s, i) => {
      const p = PRODUTOS.find((x) => x.id === i.id);
      return s + (p ? p.preco * i.qtd : 0);
    }, 0);

  function adicionar(id) {
    const p = PRODUTOS.find((x) => x.id === id);
    const tam = tamanhoEscolhido[id];
    if (!tam) return avisar("Escolha um tamanho primeiro");
    const existente = sacola.find((i) => i.id === id && i.tam === tam);
    existente ? existente.qtd++ : sacola.push({ id, tam, qtd: 1 });
    salvar();
    renderSacola();
    const cont = $("#contador");
    cont.classList.remove("pulo"); void cont.offsetWidth; cont.classList.add("pulo");
    avisar(`${p.nome} (${tam}) adicionado`);
  }

  // ---------- Abrir / fechar ----------
  function abrir() {
    $("#sacola").classList.add("aberta");
    $("#sacola").setAttribute("aria-hidden", "false");
    $("#fundo").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function fechar() {
    $("#sacola").classList.remove("aberta");
    $("#sacola").setAttribute("aria-hidden", "true");
    $("#fundo").hidden = true;
    document.body.style.overflow = "";
  }

  let timerAviso;
  function avisar(msg) {
    const a = $("#aviso");
    a.textContent = msg;
    a.classList.add("visivel");
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => a.classList.remove("visivel"), 2200);
  }

  // ---------- WhatsApp ----------
  function finalizar() {
    const nomeEl = $("#nomeCliente");
    const nome = nomeEl.value.trim();
    if (!nome) {
      nomeEl.classList.add("erro");
      nomeEl.focus();
      return avisar("Informe seu nome para finalizar");
    }
    nomeEl.classList.remove("erro");

    const linhas = sacola.map((i) => {
      const p = PRODUTOS.find((x) => x.id === i.id);
      return `• ${i.qtd}x ${p.nome} — Tam. ${i.tam} — ${brl(p.preco * i.qtd)}`;
    });
    const obs = $("#obs").value.trim();
    const msg = [
      `Olá, ${LOJA.nome}! Gostaria de fazer um pedido:`,
      "",
      ...linhas,
      "",
      `*Total: ${brl(total())}*`,
      "",
      `Nome: ${nome}`,
      obs ? `Observação: ${obs}` : "",
    ].filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();

    window.open(`https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // ---------- Eventos ----------
  $("#filtros").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    filtro = b.dataset.cat;
    renderFiltros();
    renderCatalogo();
  });

  $("#grade").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tam]");
    if (t) {
      tamanhoEscolhido[+t.dataset.id] = t.dataset.tam;
      t.parentElement.querySelectorAll(".tam").forEach((b) => {
        const on = b === t;
        b.classList.toggle("ativo", on);
        b.setAttribute("aria-checked", on);
      });
      return;
    }
    const a = e.target.closest("[data-add]");
    if (a) adicionar(+a.dataset.add);
  });

  $("#itens").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const { mais, menos, remover } = b.dataset;
    if (mais !== undefined) sacola[+mais].qtd++;
    if (menos !== undefined) { const i = sacola[+menos]; i.qtd > 1 ? i.qtd-- : sacola.splice(+menos, 1); }
    if (remover !== undefined) sacola.splice(+remover, 1);
    salvar();
    renderSacola();
  });

  $("#abrirSacola").addEventListener("click", abrir);
  $("#fecharSacola").addEventListener("click", fechar);
  $("#fundo").addEventListener("click", fechar);
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());
  $("#finalizar").addEventListener("click", finalizar);

  // ---------- Início ----------
  if (LOJA.logo) $("#marca").innerHTML = `<img src="${LOJA.logo}" alt="${LOJA.nome}" />`;
  const zap = `https://wa.me/${LOJA.whatsapp}`;
  $("#linkWhats").href = zap;
  $("#whatsFlutuante").href = zap;
  if (LOJA.instagram) { $("#linkInsta").href = LOJA.instagram; $("#linkInsta").hidden = false; }
  // Faixa rolante (repetida para o loop ficar contínuo)
  const frases = (LOJA.faixa || []).map((f) => `<span>${f}</span>`).join("");
  $("#faixa").innerHTML = frases.repeat(4);
  // Menu: atalhos para as categorias
  $("#nav").innerHTML = LOJA.emBreve ? "" : categorias().map((c) => `<a href="#catalogo" data-cat="${c}">${c}</a>`).join("");
  $("#nav").addEventListener("click", (e) => {
    const a = e.target.closest("[data-cat]");
    if (!a) return;
    filtro = a.dataset.cat;
    renderFiltros();
    renderCatalogo();
  });
  $("#ano").textContent = new Date().getFullYear();
  renderFiltros();
  renderCatalogo();
  renderSacola();
})();
