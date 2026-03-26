/* MujMakler.cz – vanilla JS */
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
    // tlačítko vloží layout.js – stačí ho najít a přidat logiku
    const btn = $("#backToTop") || $(".back-to-top");
    if(!btn) return;
    window.addEventListener("scroll", ()=>{
      btn.classList.toggle("visible", window.scrollY > 400);
    }, {passive:true});
    btn.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));
  }

  function initHeader(){
    const burger = $("#burger");
    const panel = $("#mobilePanel");
    if(burger && panel){
      const toggleFn = ()=>{
        const open = panel.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        panel.setAttribute("aria-hidden", open ? "false" : "true");
        try{ document.documentElement.classList.toggle('mm-menu-open', !!open); }catch(_){}
      };
      burger.addEventListener("click", toggleFn);
      // close when clicking a nav link on mobile
      $$("a[data-nav]", panel).forEach(a=>{
        a.addEventListener("click", ()=>{
          panel.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          panel.setAttribute("aria-hidden", "true");
        });
      });
    }

    // Active link
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$("a[data-nav]").forEach(a=>{
      const href = (a.getAttribute("href")||"").toLowerCase();
      if(href === path){
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function handleForms(){
    const endpoint = "mail.php";

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
          toast("Odeslání selhalo. Otevíráme záložní e-mailového klienta — zpráva je předvyplněná.");
        };

        if(submitBtn){
          submitBtn.disabled = true;
          submitBtn.textContent = "Odesílám…";
        }

        const fd = new FormData();
        fd.append("_subject", labels[kind] || "Nová zpráva z webu");
        fd.append("_source", location.href);
        fd.append("_hp", ""); // honeypot (prázdné = člověk)

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
    // Team mini
    const team = (data.brokers || []).slice(0,3);
    const box = $("#teamMini");
    if(box){
      box.innerHTML = team.map((b,i)=>`
        <div class="card pad reveal${i>0?` reveal-delay-${Math.min(i,3)}`:''}">
          <div style="display:flex; gap:12px; align-items:center">
            <img src="${esc(b.avatar)}" alt="${esc(b.name)}" style="width:54px;height:54px;border-radius:14px;border:1px solid var(--border);object-fit:cover;flex-shrink:0">
            <div>
              <div style="font-weight:900">${esc(b.name)}</div>
              <div class="small" style="color:var(--muted)">${esc(b.region)} • ${esc(b.role)}</div>
            </div>
          </div>
          <div class="hr"></div>
          <div class="small" style="display:flex; gap:10px; flex-wrap:wrap">
            <span class="badge"><strong>${esc(b.sold)}</strong> prodáno</span>
            <span class="badge">★ ${esc(b.rating)}</span>
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
        <div style="display:flex; gap:14px; align-items:center">
          <img src="${esc(b.avatar)}" alt="${esc(b.name)}" style="width:72px;height:72px;border-radius:18px;border:1px solid var(--border);object-fit:cover;flex-shrink:0">
          <div>
            <div style="font-weight:900; font-size:16px">${esc(b.name)}</div>
            <div class="small" style="color:var(--muted)">${esc(b.role)}</div>
            <div class="small" style="margin-top:2px; color:var(--primary); font-weight:600">${esc(b.region)}</div>
          </div>
        </div>
        <div class="hr"></div>
        <div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px">
          <div style="text-align:center; background:var(--surface); border-radius:10px; padding:10px 6px">
            <div style="font-weight:900; font-size:18px">${esc(b.sold)}</div>
            <div class="small" style="color:var(--muted)">Prodáno</div>
          </div>
          <div style="text-align:center; background:var(--surface); border-radius:10px; padding:10px 6px">
            <div style="font-weight:900; font-size:18px">${esc(b.reviews)}</div>
            <div class="small" style="color:var(--muted)">Reference</div>
          </div>
          <div style="text-align:center; background:var(--surface); border-radius:10px; padding:10px 6px">
            <div style="font-weight:900; font-size:18px; color:var(--primary)">${esc(b.rating)}</div>
            <div class="small" style="color:var(--muted)">Hodnocení</div>
          </div>
        </div>
        <div style="margin-top:12px" class="small">
          <div><strong>Specializace:</strong> ${esc((b.specialization||[]).join(", "))}</div>
          <div style="margin-top:6px">
            <a href="tel:${esc(b.phone.replace(/\s/g,''))}" style="color:var(--text)">${esc(b.phone)}</a>
            &nbsp;•&nbsp;
            <a href="mailto:${esc(b.email)}" style="color:var(--primary)">${esc(b.email)}</a>
          </div>
        </div>
        <div style="margin-top:14px; display:flex; gap:8px; flex-wrap:wrap">
          <a class="btn btn-ghost btn-sm" href="mailto:${esc(b.email)}">Napsat email</a>
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
    if(page === "brokers") initBrokers();
    if(page === "references") initReferences();
  }

  /* ── Lazy image blur-up ── */
  function initLazyImages(){
    if(!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const img = e.target;
          img.addEventListener("load",()=>img.classList.add("loaded"), {once:true});
          if(img.complete) img.classList.add("loaded");
          io.unobserve(img);
        }
      });
    },{rootMargin:"200px"});
    $$("img[loading='lazy']").forEach(img=>io.observe(img));
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    init();
    initLazyImages();
  });
})();
