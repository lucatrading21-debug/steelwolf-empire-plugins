/* SteelWolf Empire — CARD BEHAVIOR (comportamento canonico UNICO)
 * Un solo script per opening | handoff | closing. I kind non lo ridefiniscono.
 * Ogni blocco e' guardato: se il kind non ha quel pezzo (es. handoff non ha .grp ne' #conf)
 * il listener semplicemente non si registra, invece di lanciare (difetto dello script opening
 * copiato altrove: getElementById('conf').addEventListener su una card senza bottone).
 * La riga di conferma raccoglie i gruppi PRESENTI nell'ordine del DOM: non c'e' piu' una lista
 * hardcoded per kind, quindi non c'e' piu' un punto dove i kind possano divergere.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
(function(){
  var PRIO_GROUP = 'Priorità';

  /* pill a scelta singola, su ogni gruppo tranne quello delle priorita' */
  document.querySelectorAll('.grp').forEach(function(g){
    if(g.getAttribute('data-name')===PRIO_GROUP) return;
    g.querySelectorAll('.pill').forEach(function(b){
      b.addEventListener('click',function(){
        g.querySelectorAll('.pill').forEach(function(x){x.classList.remove('sel');});
        b.classList.add('sel');
      });
    });
  });

  /* riferimenti rapidi */
  document.querySelectorAll('.ref[data-ask]').forEach(function(r){
    r.addEventListener('click',function(){ sendPrompt(r.getAttribute('data-ask')); });
  });

  /* selezione priorita' — solo dove le .prio sono interattive (button.pbtn) */
  var prios=document.querySelectorAll('.prio'), nextp=document.getElementById('nextp');
  prios.forEach(function(p){
    var btn=p.querySelector('button.pbtn');
    if(!btn) return;
    btn.addEventListener('click',function(e){
      if(e.target.closest('details')) return;
      prios.forEach(function(x){x.classList.remove('on');});
      p.classList.add('on');
      if(nextp) nextp.textContent=p.querySelector('.badge').textContent+' — '+p.querySelector('.ptitle').textContent;
    });
  });

  /* espandi/comprimi tutti i dettagli */
  var expall=document.getElementById('expall'), op=false;
  if(expall) expall.addEventListener('click',function(){
    op=!op;
    document.querySelectorAll('.prio>details').forEach(function(d){ d.open=op; });
    expall.innerHTML=op?'<i class="ti ti-chevrons-up"></i> Comprimi tutti':'<i class="ti ti-chevrons-down"></i> Espandi tutti';
  });

  /* conferma */
  var conf=document.getElementById('conf');
  if(conf) conf.addEventListener('click',function(){
    var parts=[];
    document.querySelectorAll('.grp[data-name]').forEach(function(g){
      var name=g.getAttribute('data-name');
      if(name===PRIO_GROUP) return;
      var sel=g.querySelector('.pill.sel');
      parts.push(name+': '+(sel?sel.getAttribute('data-v'):'—'));
    });
    if(document.querySelector('.grp[data-name="'+PRIO_GROUP+'"]')){
      var on=document.querySelector('.prio.on button.pbtn');
      parts.push(PRIO_GROUP+': '+(on?on.getAttribute('data-v'):'—'));
    }
    var g1=document.getElementById('note'), g2=document.getElementById('addck'), g3=document.getElementById('addrm');
    var n=g1?g1.value.trim():'', c=g2?g2.value.trim():'', r=g3?g3.value.trim():'';
    if(n)parts.push('Note: '+n); if(c)parts.push('Nuova checklist: '+c); if(r)parts.push('Nuova roadmap: '+r);
    sendPrompt('{{CONFIRM_PROMPT}} — '+parts.join(' · '));
  });
})();
