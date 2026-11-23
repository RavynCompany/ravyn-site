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
            ${notaCard(p.id)}
            ${maxParcelas() > 1 ? `<span class="card-parc">Pix, débito ou até ${maxParcelas()}x no cartão</span>` : ""}
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
      $("#checkout").hidden = true;
      return;
    }
    $("#sacolaRodape").hidden = false;
    $("#checkout").hidden = false;
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
    atualizarTotais();
  }

  const subtotal = () =>
    sacola.reduce((s, i) => {
      const p = PRODUTOS.find((x) => x.id === i.id);
      return s + (p ? p.preco * i.qtd : 0);
    }, 0);

  // ---------- Pagamento ----------
  const PAG = LOJA.pagamento || { pix: 0, debito: 0, credito: { 1: 0 } };
  const NOMES = { pix: "Pix", debito: "Cartão de débito", credito: "Cartão de crédito" };
  const maxParcelas = () => Math.max(1, ...Object.keys(PAG.credito || {}).map(Number));
  let forma = "";

  function taxaAtual() {
    if (forma === "credito") return Number(PAG.credito[$("#parcelas").value]) || 0;
    if (forma) return Number(PAG[forma]) || 0;
    return 0;
  }
  // Valor cobrado para que, descontada a taxa da maquininha, sobre o subtotal cheio.
  const comTaxa = (valor, taxa) => (taxa > 0 ? Math.ceil((valor / (1 - taxa / 100)) * 100) / 100 : valor);

  function renderPagamentos() {
    const opcoes = ["pix", "debito", "credito"].filter((f) => f === "credito" ? PAG.credito && Object.keys(PAG.credito).length : PAG[f] !== undefined);
    $("#pagamentos").innerHTML = opcoes
      .map((f) => {
        const det = f === "pix" ? (PAG.pix ? `+${PAG.pix}%` : "Sem taxa")
          : f === "debito" ? (PAG.debito ? `+${String(PAG.debito).replace(".", ",")}% maquininha` : "Sem taxa")
          : `Até ${maxParcelas()}x`;
        return `<label class="pag ${forma === f ? "ativo" : ""}">
          <input type="radio" name="pagamento" value="${f}" ${forma === f ? "checked" : ""} />
          <span class="pag-nome">${f === "pix" ? "Pix" : f === "debito" ? "Débito" : "Crédito"}</span>
          <span class="pag-det">${det}</span>
        </label>`;
      })
      .join("");
  }

  function renderParcelas() {
    const sub = subtotal();
    const sel = $("#parcelas");
    const atual = sel.value || "1";
    sel.innerHTML = Object.keys(PAG.credito || {})
      .map(Number).sort((a, b) => a - b)
      .map((n) => {
        const t = comTaxa(sub, Number(PAG.credito[n]) || 0);
        return `<option value="${n}" ${String(n) === atual ? "selected" : ""}>${n}x de ${brl(t / n)} (total ${brl(t)})</option>`;
      })
      .join("");
  }

  function atualizarTotais() {
    const sub = subtotal();
    renderParcelas();
    $("#campoParcelas").hidden = forma !== "credito";
    const taxa = taxaAtual();
    const tot = comTaxa(sub, taxa);
    $("#subtotal").textContent = brl(sub);
    $("#linhaTaxa").hidden = !(taxa > 0);
    $("#rotuloTaxa").textContent = `Taxa da maquininha (${String(taxa).replace(".", ",")}%)`;
    $("#valorTaxa").textContent = brl(tot - sub);
    $("#total").textContent = brl(tot);
    const n = Number($("#parcelas").value) || 1;
    $("#formaResumo").textContent = !forma ? "" : forma === "credito" ? `· crédito ${n}x de ${brl(tot / n)}` : `· ${NOMES[forma].toLowerCase()}`;
    $("#notaTaxa").textContent = forma && forma !== "pix" && taxa > 0 ? "No cartão é acrescentada a taxa da maquininha. No Pix você paga o valor das peças, sem taxa." : "";
  }

  // ---------- CEP (preenchimento automático) ----------
  async function buscarCep() {
    const cep = $("#cep").value.replace(/\D/g, "");
    const status = $("#cepStatus");
    if (cep.length !== 8) { status.textContent = ""; return; }
    status.textContent = "Buscando…";
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) throw new Error("CEP não encontrado");
      $("#rua").value = d.logradouro || $("#rua").value;
      $("#bairro").value = d.bairro || $("#bairro").value;
      $("#cidade").value = d.localidade || $("#cidade").value;
      $("#uf").value = d.uf || $("#uf").value;
      status.textContent = "✓ Endereço encontrado";
      ["rua", "bairro", "cidade", "uf"].forEach((id) => $("#" + id).classList.remove("erro"));
      salvarCliente();
      $(d.logradouro ? "#numero" : "#rua").focus();
    } catch {
      status.textContent = "Não achamos esse CEP. Preencha manualmente.";
    }
  }

  // ---------- Dados do cliente (lembrados neste navegador) ----------
  const CAMPOS = ["nomeCliente", "cep", "rua", "numero", "complemento", "bairro", "cidade", "uf"];
  function salvarCliente() {
    const d = {};
    CAMPOS.forEach((id) => (d[id] = $("#" + id).value));
    d.forma = forma;
    try { localStorage.setItem("ravyn-cliente", JSON.stringify(d)); } catch {}
  }
  function carregarCliente() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem("ravyn-cliente")) || {}; } catch {}
    CAMPOS.forEach((id) => { if (d[id]) $("#" + id).value = d[id]; });
    if (d.forma) forma = d.forma;
  }

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
    const v = (id) => $("#" + id).value.trim();
    const obrigatorios = ["nomeCliente", "cep", "rua", "numero", "bairro", "cidade", "uf"];
    let primeiroErro = null;
    obrigatorios.forEach((id) => {
      const el = $("#" + id);
      const ok = id === "cep" ? v(id).replace(/\D/g, "").length === 8 : v(id) !== "";
      el.classList.toggle("erro", !ok);
      if (!ok && !primeiroErro) primeiroErro = el;
    });
    if (primeiroErro) {
      primeiroErro.focus();
      primeiroErro.scrollIntoView({ block: "center", behavior: "smooth" });
      return avisar(primeiroErro.id === "nomeCliente" ? "Informe seu nome" : "Complete o endereço de entrega");
    }
    if (!forma) {
      $("#pagamentos").classList.add("erro");
      $("#pagamentos").scrollIntoView({ block: "center", behavior: "smooth" });
      return avisar("Escolha a forma de pagamento");
    }

    const sub = subtotal();
    const taxa = taxaAtual();
    const tot = comTaxa(sub, taxa);
    const n = Number($("#parcelas").value) || 1;
    const linhas = sacola.map((i) => {
      const p = PRODUTOS.find((x) => x.id === i.id);
      return `• ${i.qtd}x ${p.nome} — Tam. ${i.tam} — ${brl(p.preco * i.qtd)}`;
    });
    const pagamento = forma === "credito" ? `Cartão de crédito em ${n}x de ${brl(tot / n)}` : NOMES[forma];
    const cep = v("cep").replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
    const obs = v("obs");

    const codigo = novoCodigoPedido();
    const msg = [
      `Olá, ${LOJA.nome}! Gostaria de fazer um pedido:`,
      `*Pedido #${codigo}*`,
      "",
      "*🛒 Itens*",
      ...linhas,
      "",
      `Subtotal: ${brl(sub)}`,
      taxa > 0 ? `Taxa da maquininha (${String(taxa).replace(".", ",")}%): ${brl(tot - sub)}` : null,
      `*Total: ${brl(tot)}*`,
      "",
      "*💳 Pagamento*",
      pagamento,
      "",
      "*📦 Entrega*",
      v("nomeCliente"),
      `${v("rua")}, ${v("numero")}${v("complemento") ? ` — ${v("complemento")}` : ""}`,
      `${v("bairro")} — ${v("cidade")}/${v("uf").toUpperCase()}`,
      `CEP ${cep}`,
      obs ? "" : null,
      obs ? `*📝 Observação:* ${obs}` : null,
    ].filter((l) => l !== null).join("\n");

    salvarCliente();
    guardarPedido(codigo);
    window.open(`https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // ---------- Código do pedido ----------
  function novoCodigoPedido() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O e 1/I para não confundir
    let c = "";
    const r = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(5)) : [...Array(5)].map(() => Math.random() * 2 ** 32);
    for (const n of r) c += letras[n % letras.length];
    return "RVN-" + c;
  }
  function pedidosSalvos() {
    try { return JSON.parse(localStorage.getItem("ravyn-pedidos")) || []; } catch { return []; }
  }
  function guardarPedido(codigo) {
    const lista = pedidosSalvos();
    lista.unshift({ codigo, data: new Date().toISOString().slice(0, 10), itens: [...new Set(sacola.map((i) => i.id))] });
    try { localStorage.setItem("ravyn-pedidos", JSON.stringify(lista.slice(0, 20))); } catch {}
  }

  // ---------- Avaliações ----------
  const LISTA_AVAL = (typeof AVALIACOES !== "undefined" ? AVALIACOES : []).filter((a) => a && a.nota >= 1 && a.nota <= 5 && a.texto);
  const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const estrelas = (n) => `<span class="estrelas" aria-label="${n} de 5 estrelas">${"★".repeat(Math.round(n))}<span class="vazia">${"★".repeat(5 - Math.round(n))}</span></span>`;
  const media = (lista) => lista.reduce((s, a) => s + a.nota, 0) / lista.length;
  const fmtNota = (n) => n.toFixed(1).replace(".", ",");

  function notaCard(id) {
    const l = LISTA_AVAL.filter((a) => a.produto === id);
    if (!l.length) return "";
    return `<span class="card-aval">${estrelas(media(l))} ${fmtNota(media(l))} (${l.length})</span>`;
  }

  function renderAvaliacoes() {
    if (!LISTA_AVAL.length) {
      $("#avalResumo").innerHTML = "";
      $("#avalLista").innerHTML = `<div class="aval-vazio"><strong>Ainda sem avaliações</strong>As primeiras avaliações de quem comprou vão aparecer aqui.</div>`;
      $("#avalLista").style.display = "block";
      return;
    }
    const m = media(LISTA_AVAL);
    $("#avalResumo").innerHTML = `<strong>${fmtNota(m)}</strong><div>${estrelas(m)}<br><span>${LISTA_AVAL.length} avaliaç${LISTA_AVAL.length > 1 ? "ões" : "ão"} de clientes</span></div>`;
    $("#avalLista").innerHTML = [...LISTA_AVAL]
      .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))
      .map((a) => {
        const p = PRODUTOS.find((x) => x.id === a.produto);
        return `<article class="aval-card">
          ${estrelas(a.nota)}
          <p class="aval-texto">“${escapar(a.texto)}”</p>
          ${p ? `<span class="aval-produto">${escapar(p.nome)}</span>` : ""}
          <div class="aval-autor"><span><strong>${escapar(a.nome || "Cliente")}</strong>${a.cidade ? ` · ${escapar(a.cidade)}` : ""}</span><span class="verificado">✔ Compra verificada</span></div>
        </article>`;
      })
      .join("");
  }

  let notaEscolhida = 0;
  function renderEstrelasInput() {
    $("#avalEstrelas").innerHTML = [1, 2, 3, 4, 5]
      .map((n) => `<button type="button" role="radio" aria-checked="${n === notaEscolhida}" aria-label="${n} estrela${n > 1 ? "s" : ""}" data-nota="${n}" class="${n <= notaEscolhida ? "on" : ""}">★</button>`)
      .join("");
  }
  function opcoesProduto(ids) {
    const lista = ids && ids.length ? PRODUTOS.filter((p) => ids.includes(p.id)) : PRODUTOS;
    $("#avalProduto").innerHTML = `<option value="">Escolha a peça</option>` + lista.map((p) => `<option value="${p.id}">${escapar(p.nome)}</option>`).join("");
  }
  function sincronizarPedido() {
    const cod = $("#avalPedido").value.trim().toUpperCase();
    const ped = pedidosSalvos().find((x) => x.codigo === cod);
    opcoesProduto(ped ? ped.itens : null);
  }
  function abrirAvaliar() {
    const peds = pedidosSalvos();
    $("#avalPedidosSalvos").innerHTML = peds.map((x) => `<option value="${x.codigo}">${x.data}</option>`).join("");
    if (peds.length && !$("#avalPedido").value) $("#avalPedido").value = peds[0].codigo;
    if (!$("#avalNome").value) $("#avalNome").value = $("#nomeCliente").value;
    if (!$("#avalCidade").value && $("#cidade").value) $("#avalCidade").value = `${$("#cidade").value}${$("#uf").value ? "/" + $("#uf").value : ""}`;
    sincronizarPedido();
    renderEstrelasInput();
    $("#modalAvaliar").hidden = false;
    document.body.style.overflow = "hidden";
    $("#avalPedido").focus();
  }
  function fecharAvaliar() {
    $("#modalAvaliar").hidden = true;
    document.body.style.overflow = "";
  }
  function enviarAvaliacao(e) {
    e.preventDefault();
    const cod = $("#avalPedido").value.trim().toUpperCase();
    const checks = [
      [$("#avalPedido"), /^RVN-[A-Z0-9]{5}$/.test(cod), "Informe o código do pedido (ex.: RVN-7K2QX)"],
      [$("#avalProduto"), !!$("#avalProduto").value, "Escolha a peça que você comprou"],
      [$("#avalEstrelas"), notaEscolhida > 0, "Dê uma nota de 1 a 5 estrelas"],
      [$("#avalTexto"), $("#avalTexto").value.trim().length >= 10, "Escreva um comentário (pelo menos 10 letras)"],
      [$("#avalNome"), !!$("#avalNome").value.trim(), "Informe seu nome"],
    ];
    checks.forEach(([el, ok]) => el.classList.toggle("erro", !ok));
    const falha = checks.find(([, ok]) => !ok);
    if (falha) { falha[0].scrollIntoView({ block: "center" }); if (falha[0].focus) falha[0].focus(); return avisar(falha[2]); }

    const p = PRODUTOS.find((x) => x.id === +$("#avalProduto").value);
    const msg = [
      `⭐ *Avaliação de compra — ${LOJA.nome}*`,
      `Pedido #${cod}`,
      "",
      `Peça: ${p ? p.nome : $("#avalProduto").value}`,
      `Nota: ${"★".repeat(notaEscolhida)}${"☆".repeat(5 - notaEscolhida)} (${notaEscolhida}/5)`,
      `Comentário: ${$("#avalTexto").value.trim()}`,
      "",
      `Nome: ${$("#avalNome").value.trim()}`,
      $("#avalCidade").value.trim() ? `Cidade: ${$("#avalCidade").value.trim()}` : null,
    ].filter((l) => l !== null).join("\n");
    window.open(`https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    fecharAvaliar();
    avisar("Valeu! Sua avaliação aparece no site assim que confirmarmos a compra.");
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
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { fechar(); fecharAvaliar(); } });
  $("#finalizar").addEventListener("click", finalizar);
  $("#checkout").addEventListener("submit", (e) => { e.preventDefault(); finalizar(); });
  $("#pagamentos").addEventListener("change", (e) => {
    if (e.target.name !== "pagamento") return;
    forma = e.target.value;
    $("#pagamentos").classList.remove("erro");
    renderPagamentos();
    atualizarTotais();
    salvarCliente();
  });
  $("#parcelas").addEventListener("change", atualizarTotais);
  $("#abrirAvaliar").addEventListener("click", abrirAvaliar);
  $("#fecharAvaliar").addEventListener("click", fecharAvaliar);
  $("#modalAvaliar").addEventListener("click", (e) => e.target.id === "modalAvaliar" && fecharAvaliar());
  $("#formAvaliar").addEventListener("submit", enviarAvaliacao);
  $("#avalPedido").addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/\s/g, "");
    e.target.classList.remove("erro");
    sincronizarPedido();
  });
  $("#avalEstrelas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-nota]");
    if (!b) return;
    notaEscolhida = +b.dataset.nota;
    $("#avalEstrelas").classList.remove("erro");
    renderEstrelasInput();
  });
  $("#formAvaliar").addEventListener("input", (e) => e.target.classList.remove("erro"));
  $("#cep").addEventListener("input", (e) => {
    let d = e.target.value.replace(/\D/g, "").slice(0, 8);
    e.target.value = d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
    if (d.length === 8) buscarCep();
  });
  $("#uf").addEventListener("input", (e) => (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "")));
  $("#checkout").addEventListener("input", (e) => {
    if (e.target.classList.contains("erro") && e.target.value.trim()) e.target.classList.remove("erro");
    salvarCliente();
  });

  // ---------- Início ----------
  if (LOJA.tituloGrafite) $("#tituloGrafite").src = `img/titulo-${LOJA.tituloGrafite}.webp`;
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
  carregarCliente();
  renderPagamentos();
  renderFiltros();
  renderCatalogo();
  renderSacola();
  renderAvaliacoes();
})();
