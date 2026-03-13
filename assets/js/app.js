/* MujMakler.cz demo – vanilla JS */
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const data = window.MUJMAKLER_DATA || {};

  function fmtPrice(p){
    if(!p) return "";
    const s = new Intl.NumberFormat("cs-CZ").format(p);
    return s;
  }
  function esc(s){ return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

  function toast(msg){
    const t = $("#toast");
    if(!t) return;
    t.textContent = msg;
    t.classList.add("is-open");
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove("is-open"), 3200);
  }

  /* ── Scroll reveal ── */
  function initReveal(){
    const els = $$(".reveal:not(.visible)");
    if(!els.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },{threshold:.12});
    els.forEach(el=>io.observe(el));
  }

  /* ── Animovaný čítač ── */
  function animateCounter(el){
    const target = parseFloat(el.getAttribute("data-target"));
    if(isNaN(target)) return;
    const suffix = el.getAttribute("data-suffix") || "";
    const isDecimal = el.getAttribute("data-decimal") === "true";
    const duration = 1600;
    const start = performance.now();
    function step(now){
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = ease * target;
      el.textContent = (isDecimal ? (val/10).toFixed(1) : Math.round(val)) + suffix;
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters(){
    const counters = $$("[data-target]");
    if(!counters.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          animateCounter(e.target);
          io.unobserve(e.target);
        }
      });
    },{threshold:.5});
    counters.forEach(el=>io.observe(el));
  }

  /* ── Sticky header scrolled state ── */
  function initScrollHeader(){
    const header = $(".header");
    if(!header) return;
    window.addEventListener("scroll", ()=>{
      header.classList.toggle("scrolled", window.scrollY > 20);
    }, {passive:true});
  }

  /* ── Back to top ── */
  function initBackToTop(){
    const btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Zpět nahoru");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
    document.body.appendChild(btn);
    window.addEventListener("scroll", ()=>{
      btn.classList.toggle("visible", window.scrollY > 400);
    }, {passive:true});
    btn.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));
  }

  function initHeader(){
    const burger = $("#burger");
    const panel = $("#mobilePanel");
    if(burger && panel){
      burger.addEventListener("click", ()=> panel.classList.toggle("is-open"));
      // close when clicking a nav link on mobile
      $$("a[data-nav]", panel).forEach(a=>{
        a.addEventListener("click", ()=> panel.classList.remove("is-open"));
      });
    }
    // Active link
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$("a[data-nav]").forEach(a=>{
      const href = (a.getAttribute("href")||"").toLowerCase();
      if(href === path) a.classList.add("active");
    });
  }

  function handleForms(){
    const inbox = "petr.novak@mujmakler.cz";
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`;

    function buildMailto(form, kind){
      const fields = [];
      const controls = Array.from(form.querySelectorAll("input, select, textarea"));
      controls.forEach((control, index)=>{
        const clean = String(control.value || "").trim();
        if(!clean) return;
        const label = control.name || control.id || control.getAttribute("placeholder") || control.getAttribute("aria-label") || `Pole ${index + 1}`;
        fields.push(`${label}: ${clean}`);
      });

      const labels = {
        valuation: "Rychlý odhad",
        sell: "Prodej nemovitosti",
        contact: "Kontaktní formulář",
        interest: "Zájem o nemovitost",
        career: "Kariéra",
        newsletter: "Newsletter"
      };

      const subject = labels[kind] || "Nová zpráva z webu";
      const body = [
        `Zdroj: ${location.href}`,
        "",
        ...fields
      ].join("\n");

      return `mailto:${inbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    $$("form[data-form]").forEach(form=>{
      form.addEventListener("submit", (e)=>{
        e.preventDefault();
        const kind = form.getAttribute("data-form");
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : "";

        const labels = {
          valuation: "Rychlý odhad",
          sell: "Prodej nemovitosti",
          contact: "Kontaktní formulář",
          interest: "Zájem o nemovitost",
          career: "Kariéra",
          newsletter: "Newsletter"
        };

        const sendWithFallback = () => {
          window.location.href = buildMailto(form, kind);
          toast("Nepodařilo se odeslat automaticky. Otevíráme váš e-mail s předvyplněnou zprávou.");
        };

        if(submitBtn){
          submitBtn.disabled = true;
          submitBtn.textContent = "Odesílám…";
        }

        const fd = new FormData();
        fd.append("_subject", labels[kind] || "Nová zpráva z webu");
        fd.append("_template", "table");
        fd.append("_captcha", "false");
        fd.append("_source", location.href);

        const controls = Array.from(form.querySelectorAll("input, select, textarea"));
        controls.forEach((control, index)=>{
          if(control.type === "submit" || control.type === "button") return;
          if((control.type === "checkbox" || control.type === "radio") && !control.checked) return;

          const clean = String(control.value || "").trim();
          if(!clean) return;

          const label = control.name || control.id || control.getAttribute("placeholder") || control.getAttribute("aria-label") || `Pole ${index + 1}`;
          fd.append(label, clean);
        });

        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: fd
        })
          .then(async (res)=>{
            const payload = await res.json().catch(()=> ({}));
            if(!res.ok || payload?.success === "false") throw new Error(payload?.message || "Request failed");
            toast("Děkujeme! Formulář byl odeslán a odpovíme vám co nejdříve.");
            form.reset();
          })
          .catch(()=>{
            sendWithFallback();
          })
          .finally(()=>{
            if(submitBtn){
              submitBtn.disabled = false;
              submitBtn.textContent = originalBtnText;
            }
          });
      });
    });
  }

  function propertyTag(status){
    if(status === "prodej") return `<span class="badge primary">Prodej</span>`;
    if(status === "pronajem") return `<span class="badge primary">Pronájem</span>`;
    return `<span class="badge">Prodáno</span>`;
  }

  function renderPropertyCard(p){
    const priceText = p.status === "prodano" ? "Prodáno" : `${fmtPrice(p.price)} ${esc(p.priceNote)}`;
    const img = (p.images && p.images[0]) ? p.images[0] : "assets/img/property-1.jpg";
    return `
      <article class="card prop">
        <a href="nemovitost.html?id=${encodeURIComponent(p.id)}" aria-label="Detail nemovitosti">
          <div class="img"><img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy"></div>
        </a>
        <div class="body">
          <div class="tagrow">
            ${propertyTag(p.status)}
            <span class="badge">${esc(p.rooms)}</span>
            <span class="badge">${esc(p.area)} m²</span>
          </div>
          <div class="title">${esc(p.title)}</div>
          <div class="meta">
            <span>${esc(p.location)}</span>
          </div>
          <div class="footer">
            <div class="price">${esc(priceText)}</div>
            <a class="btn btn-ghost btn-sm" href="nemovitost.html?id=${encodeURIComponent(p.id)}">Detail</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderProperties(container, list){
    if(!container) return;
    container.innerHTML = list.map(renderPropertyCard).join("");
  }

  function parseQuery(){
    const q = {};
    const sp = new URLSearchParams(location.search);
    sp.forEach((v,k)=> q[k]=v);
    return q;
  }


  function initRefMini(){
    const refBox = document.getElementById("refMini");
    if(!refBox) return;
    const refs = (data.testimonials || []).slice(0,3);
    refBox.innerHTML = refs.map((t,i)=>`
      <div class="card pad reveal${i>0?` reveal-delay-${Math.min(i,3)}`:''}">
        <div class="badge primary">★★★★★</div>
        <div style="margin-top:10px; font-weight:800">${esc(t.type)} • ${esc(t.location)}</div>
        <p class="p" style="margin-top:6px">${esc(t.story)}</p>
        <div class="small" style="margin-top:10px">— ${esc(t.name)}</div>
      </div>
    `).join("");
  }

  function initHome(){
    const featured = (data.properties || []).filter(p=>p.featured).slice(0,3);
    renderProperties($("#featuredProperties"), featured);

    // Team mini
    const team = (data.brokers || []).slice(0,3);
    const box = $("#teamMini");
    if(box){
      box.innerHTML = team.map((b,i)=>`
        <div class="card pad reveal${i>0?` reveal-delay-${Math.min(i,3)}`:''}">
          <div style="display:flex; gap:12px; align-items:center">
            <img src="${esc(b.avatar)}" alt="${esc(b.name)}" style="width:54px;height:54px;border-radius:14px;border:1px solid var(--border);object-fit:cover">
            <div>
              <div style="font-weight:900">${esc(b.name)}</div>
              <div class="small">${esc(b.region)} • ${esc(b.role)}</div>
            </div>
          </div>
          <div class="hr"></div>
          <div class="small" style="display:flex; gap:10px; flex-wrap:wrap">
            <span class="badge">Prodáno: ${esc(b.sold)}</span>
            <span class="badge">Hodnocení: ${esc(b.rating)}</span>
          </div>
          <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
            <a class="btn btn-ghost btn-sm" href="makleri.html">Profil</a>
            <a class="btn btn-primary btn-sm" href="kontakt.html">Domluvit schůzku</a>
          </div>
        </div>
      `).join("");
    }

    // References snippet
    const refBox = $("#refMini");
    if(refBox){
      const refs = (data.testimonials || []).slice(0,3);
      refBox.innerHTML = refs.map((t,i)=>`
        <div class="card pad reveal${i>0?` reveal-delay-${Math.min(i,3)}`:''}">
          <div class="badge primary">★★★★★</div>
          <div style="margin-top:10px; font-weight:800">${esc(t.type)} • ${esc(t.location)}</div>
          <p class="p" style="margin-top:6px">${esc(t.story)}</p>
          <div class="small" style="margin-top:10px">— ${esc(t.name)}</div>
        </div>
      `).join("");
      initReveal();
    }

    // hero search → listings
    const form = $("#heroSearchForm");
    if(form){
      form.addEventListener("submit", (e)=>{
        e.preventDefault();
        const q = ($("#heroQuery")?.value || "").trim();
        const status = $("#heroStatus")?.value || "all";
        const url = new URL("nemovitosti.html", location.href);
        if(q) url.searchParams.set("q", q);
        if(status && status !== "all") url.searchParams.set("status", status);
        location.href = url.toString();
      });
    }
  }

  function initListings(){
    const q = parseQuery();
    let status = q.status || "all";
    let query = (q.q || "").trim().toLowerCase();

    const input = $("#listQuery");
    if(input) input.value = q.q || "";

    function apply(){
      let list = (data.properties || []).slice();
      if(status !== "all"){
        list = list.filter(p=>p.status === status);
      }
      if(query){
        list = list.filter(p=>{
          const hay = `${p.title} ${p.location} ${p.rooms} ${p.type}`.toLowerCase();
          return hay.includes(query);
        });
      }
      renderProperties($("#propertiesGrid"), list);
      $("#listCount") && ($("#listCount").textContent = `${list.length} položek`);
    }

    // tabs
    $$("[data-tab-status]").forEach(btn=>{
      const s = btn.getAttribute("data-tab-status");
      if(s === status) btn.classList.add("active");
      btn.addEventListener("click", ()=>{
        status = s;
        $$("[data-tab-status]").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        apply();
      });
    });

    // search
    $("#listSearchForm")?.addEventListener("submit", (e)=>{
      e.preventDefault();
      query = (input?.value || "").trim().toLowerCase();
      apply();
    });

    apply();
  }

  function initPropertyDetail(){
    const q = parseQuery();
    const id = q.id || "p1";
    const p = (data.properties || []).find(x=>x.id===id) || (data.properties||[])[0];
    if(!p) return;

    const broker = (data.brokers || []).find(b=>b.id===p.brokerId);

    $("#propTitle") && ($("#propTitle").textContent = p.title);
    $("#propLocation") && ($("#propLocation").textContent = p.location);
    $("#propPrice") && ($("#propPrice").textContent = p.status==="prodano" ? "Prodáno" : `${fmtPrice(p.price)} ${p.priceNote}`);
    $("#propShort") && ($("#propShort").textContent = p.short || "");

    // badges
    const badges = $("#propBadges");
    if(badges){
      badges.innerHTML = `
        ${propertyTag(p.status)}
        <span class="badge">${esc(p.rooms)}</span>
        <span class="badge">${esc(p.area)} m²</span>
        <span class="badge">${esc(p.type)}</span>
      `;
    }

    // params
    const params = $("#propParams");
    if(params){
      const entries = Object.entries(p.params || {});
      params.innerHTML = entries.map(([k,v])=>`
        <div class="card pad" style="display:flex; align-items:center; justify-content:space-between; gap:12px">
          <div style="font-weight:800">${esc(k)}</div>
          <div class="small">${esc(v)}</div>
        </div>
      `).join("");
    }

    // pdf
    const pdf = $("#propPdf");
    if(pdf && p.pdf){
      pdf.setAttribute("href", p.pdf);
    }

    // gallery
    const imgs = (p.images || []).slice(0,4);
    const main = $("#galleryMainImg");
    const thumbs = $("#galleryThumbs");
    if(main && imgs.length){
      main.src = imgs[0];
      main.alt = p.title;
    }
    if(thumbs){
      thumbs.innerHTML = imgs.map((src, idx)=>`
        <div class="thumb" data-src="${esc(src)}" data-idx="${idx}">
          <img src="${esc(src)}" alt="Fotka ${idx+1}" loading="lazy">
        </div>
      `).join("");
      $$(".thumb", thumbs).forEach(th=>{
        th.addEventListener("click", ()=>{
          const src = th.getAttribute("data-src");
          if(main && src){ main.src = src; }
        });
      });
    }

    // modal gallery
    const modal = $("#imgModal");
    const modalImg = $("#imgModalImg");
    function openModal(src){
      if(!modal || !modalImg) return;
      modalImg.src = src;
      modal.classList.add("is-open");
    }
    $("#galleryMain")?.addEventListener("click", ()=> main?.src && openModal(main.src));
    $("#modalClose")?.addEventListener("click", ()=> modal?.classList.remove("is-open"));
    modal?.addEventListener("click",(e)=>{ if(e.target === modal) modal.classList.remove("is-open"); });

    // broker card
    if(broker){
      $("#brokerName") && ($("#brokerName").textContent = broker.name);
      $("#brokerRole") && ($("#brokerRole").textContent = broker.role);
      $("#brokerPhone") && ($("#brokerPhone").textContent = broker.phone);
      $("#brokerEmail") && ($("#brokerEmail").textContent = broker.email);
      $("#brokerAvatar") && ($("#brokerAvatar").src = broker.avatar);
    }

    // 3D/video placeholders (just show if present)
    $("#tourLink") && (p.tour ? $("#tourLink").setAttribute("href", p.tour) : $("#tourLink").style.display="none");
    $("#videoLink") && (p.video ? $("#videoLink").setAttribute("href", p.video) : $("#videoLink").style.display="none");
  }

  function initBrokers(){
    const listAll = (data.brokers || []).slice();
    let region = "Vše";
    let query = "";

    const chips = $("#regionChips");
    if(chips){
      const regions = ["Vše", ...Array.from(new Set(listAll.map(b=>b.region)))];
      chips.innerHTML = regions.map(r=>`<button class="tab ${r===region?'active':''}" data-region="${esc(r)}">${esc(r)}</button>`).join("");
      $$("button[data-region]", chips).forEach(btn=>{
        btn.addEventListener("click", ()=>{
          region = btn.getAttribute("data-region");
          $$("button[data-region]", chips).forEach(b=>b.classList.remove("active"));
          btn.classList.add("active");
          apply();
        });
      });
    }

    $("#brokerSearch")?.addEventListener("input",(e)=>{
      query = (e.target.value || "").trim().toLowerCase();
      apply();
    });

    $("#brokerSort")?.addEventListener("change",(e)=>{
      apply();
    });

    function card(b, idx){
      const delay = idx % 3;
      const revealClass = `reveal${delay > 0 ? ` reveal-delay-${delay}` : ''}`;
      return `
      <article class="card pad ${revealClass}">
        <div style="display:flex; gap:12px; align-items:center">
          <img src="${esc(b.avatar)}" alt="${esc(b.name)}" style="width:72px;height:72px;border-radius:18px;border:1px solid var(--border);object-fit:cover">
          <div>
            <div style="font-weight:900; font-size:16px">${esc(b.name)}</div>
            <div class="small">${esc(b.role)}</div>
            <div class="small">${esc(b.region)}</div>
          </div>
        </div>
        <div class="hr"></div>
        <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px">
          <div class="card pad" style="padding:10px">
            <div class="small">Prodáno</div>
            <div style="font-weight:900">${esc(b.sold)}</div>
          </div>
          <div class="card pad" style="padding:10px">
            <div class="small">Reference</div>
            <div style="font-weight:900">${esc(b.reviews)}</div>
          </div>
          <div class="card pad" style="padding:10px">
            <div class="small">Hodnocení</div>
            <div style="font-weight:900">${esc(b.rating)}</div>
          </div>
        </div>
        <div style="margin-top:12px" class="small">
          <div><strong>Specializace:</strong> ${esc((b.specialization||[]).join(", "))}</div>
          <div style="margin-top:6px"><strong>Kontakt:</strong> ${esc(b.phone)} • ${esc(b.email)}</div>
        </div>
        <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
          <a class="btn btn-ghost btn-sm" href="kontakt.html">Kontakt</a>
          <a class="btn btn-primary btn-sm" href="kontakt.html">Domluvit schůzku</a>
        </div>
      </article>
      `;
    }

    function apply(){
      let list = listAll.slice();
      if(region !== "Vše"){
        list = list.filter(b=>b.region === region);
      }
      if(query){
        list = list.filter(b=>{
          const hay = `${b.name} ${b.region} ${b.role} ${(b.specialization||[]).join(" ")}`.toLowerCase();
          return hay.includes(query);
        });
      }
      const sort = $("#brokerSort")?.value || "sold";
      if(sort === "sold") list.sort((a,b)=>b.sold-a.sold);
      if(sort === "rating") list.sort((a,b)=>b.rating-a.rating);
      if(sort === "reviews") list.sort((a,b)=>b.reviews-a.reviews);

      const grid = $("#brokersGrid");
      if(grid){
        grid.innerHTML = list.map((b,i)=>card(b,i)).join("");
        // trigger reveal on newly inserted cards
        initReveal();
        $("#brokerCount") && ($("#brokerCount").textContent = `${list.length} makléřů`);
      }
    }

    apply();
  }

  function initReferences(){
    const box = $("#refsGrid");
    if(!box) return;
    const items = data.testimonials || [];
    box.innerHTML = items.map((t,i)=>`
      <article class="card pad reveal${i%3>0?` reveal-delay-${i%3}`:''}">
        <div class="badge primary">★★★★★</div>
        <div style="margin-top:10px; font-weight:900">${esc(t.type)}</div>
        <div class="small">${esc(t.location)}</div>
        <p class="p" style="margin-top:10px">${esc(t.story)}</p>
        <div class="small" style="margin-top:10px">— ${esc(t.name)}</div>
      </article>
    `).join("");
    initReveal();
  }

  function init(){
    initHeader();
    initScrollHeader();
    initReveal();
    initCounters();
    initBackToTop();
    handleForms();
    initRefMini();

    const page = document.body.getAttribute("data-page");
    if(page === "home") initHome();
    if(page === "listings") initListings();
    if(page === "property") initPropertyDetail();
    if(page === "brokers") initBrokers();
    if(page === "references") initReferences();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
