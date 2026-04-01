(function(){
  var blockCount = 0;
  var currentEditorId = null;
  var savedSelMap = {};
  var popup = document.getElementById('globalColorPopup');
  var currentBlobUrl = null;

  /* ── UTILS ── */
  window.syncPicker = function(p,h){ document.getElementById(h).value = document.getElementById(p).value; };
  window.syncHex = function(h,p){ var v=document.getElementById(h).value; if(/^#[0-9a-fA-F]{6}$/.test(v)) document.getElementById(p).value=v; };
  function val(id){ return document.getElementById(id).value.trim(); }
  function checked(id){ return document.getElementById(id).checked; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* auto-resize textarea */
  window.autoResize = function(el){ el.style.height='auto'; el.style.height=el.scrollHeight+'px'; };

  window.insertVar = function(inputId, text){
    var inp=document.getElementById(inputId), s=inp.selectionStart;
    inp.value=inp.value.slice(0,s)+text+inp.value.slice(inp.selectionEnd);
    updatePreview();
  };

  window.toggleOpt = function(checkId,fieldsId,blockId){
    var on=checked(checkId);
    var f=document.getElementById(fieldsId); if(f) f.style.display=on?'flex':'none';
    var b=document.getElementById(blockId); if(b) b.classList.toggle('enabled',on);
  };

  window.setView = function(mode){
    document.getElementById('btnDesktop').classList.toggle('active',mode==='desktop');
    document.getElementById('btnMobile').classList.toggle('active',mode==='mobile');
    document.getElementById('previewWrap').classList.toggle('mobile',mode==='mobile');
    // aguarda a transição de largura (300ms) e recalcula a altura do iframe
    setTimeout(function(){ updatePreview(); }, 320);
  };

  /* ── CLEAN PASTED HTML ── */
  /* Remove atributos do ProseMirror e outros editores ricos */
  function cleanPastedHTML(html){
    var div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('*').forEach(function(el){
      // remover atributos data-* e class vindos de editores
      Array.from(el.attributes).forEach(function(attr){
        if(attr.name.startsWith('data-') || attr.name==='class' || attr.name==='id'){
          el.removeAttribute(attr.name);
        }
      });
    });
    return div.innerHTML;
  }

  /* ── SELECTION ── */
  window.saveSelFor = function(edId){
    var ed=document.getElementById(edId); ed.focus();
    var sel=window.getSelection();
    if(sel&&sel.rangeCount>0) savedSelMap[edId]=sel.getRangeAt(0).cloneRange();
  };
  function restoreSel(edId){
    var r=savedSelMap[edId]; if(!r) return false;
    var ed=document.getElementById(edId); ed.focus();
    var sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(r); return true;
  }

  /* ── COLOR POPUP ── */
  window.openColorPopup = function(triggerEl,edId){
    currentEditorId=edId;
    saveSelFor(edId);
    var rect=triggerEl.getBoundingClientRect();
    popup.style.top=(rect.bottom+4)+'px';
    popup.style.left=Math.min(rect.left,window.innerWidth-210)+'px';
    popup.classList.add('open');
    var dot=triggerEl.querySelector('.color-dot');
    var c=(dot&&dot.style.background)?dot.style.background:'#004409';
    document.getElementById('globalColorPicker').value=c;
    document.getElementById('globalColorHex').value=c;
  };
  window.onGlobalColorInput=function(){ document.getElementById('globalColorHex').value=document.getElementById('globalColorPicker').value; };
  window.onGlobalHexInput=function(){ var h=document.getElementById('globalColorHex').value; if(/^#[0-9a-fA-F]{6}$/.test(h)) document.getElementById('globalColorPicker').value=h; };

  window.applyGlobalColor=function(){
    var color=document.getElementById('globalColorHex').value;
    if(!color||!currentEditorId){popup.classList.remove('open');return;}
    if(restoreSel(currentEditorId)){
      document.execCommand('foreColor',false,color);
      var wrap=document.getElementById(currentEditorId).closest('.block-wrap');
      if(wrap){var dot=wrap.querySelector('.color-trigger .color-dot');if(dot) dot.style.background=color;}
      updatePreview();
    }
    popup.classList.remove('open');
  };

  window.resetColor=function(){
    if(!currentEditorId){popup.classList.remove('open');return;}
    if(restoreSel(currentEditorId)){
      document.execCommand('removeFormat',false,null);
      updatePreview();
    }
    popup.classList.remove('open');
  };

  document.addEventListener('mousedown',function(e){
    if(!popup.classList.contains('open')) return;
    if(!popup.contains(e.target)&&!e.target.closest('.color-trigger')) popup.classList.remove('open');
  });

  /* ── FONT SIZE ── */
  window.applyFontSize=function(selectEl,edId){
    var size=selectEl.value; if(!size) return;
    var r=savedSelMap[edId]; if(!r||r.collapsed){selectEl.value='';return;}
    var ed=document.getElementById(edId); ed.focus();
    var sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    var span=document.createElement('span'); span.style.fontSize=size;
    try{r.surroundContents(span);}catch(ex){var frag=r.extractContents();span.appendChild(frag);r.insertNode(span);}
    selectEl.value='';
    updatePreview();
  };

  /* ── RICH TEXT ── */
  window.fmtCmd=function(e,edId,cmd){e.preventDefault();document.getElementById(edId).focus();document.execCommand(cmd,false,null);updatePreview();};
  window.insertLinkFor=function(e,edId){e.preventDefault();var url=prompt('URL do link:');if(!url) return;document.getElementById(edId).focus();document.execCommand('createLink',false,url);updatePreview();};

  function buildToolbar(edId){
    return '<button class="tb-btn" onmousedown="fmtCmd(event,\''+edId+'\',\'bold\')"><b>B</b></button>'
      +'<button class="tb-btn" onmousedown="fmtCmd(event,\''+edId+'\',\'italic\')"><i>I</i></button>'
      +'<button class="tb-btn" onmousedown="fmtCmd(event,\''+edId+'\',\'underline\')"><u>U</u></button>'
      +'<div class="tb-sep"></div>'
      +'<select class="tb-size" onmousedown="saveSelFor(\''+edId+'\')" onchange="applyFontSize(this,\''+edId+'\')">'
      +'<option value="">Tam</option>'
      +'<option value="12px">12</option><option value="14px">14</option><option value="16px">16</option>'
      +'<option value="18px">18</option><option value="20px">20</option><option value="24px">24</option>'
      +'<option value="28px">28</option><option value="32px">32</option>'
      +'</select>'
      +'<div class="tb-sep"></div>'
      +'<button class="color-trigger" onmousedown="saveSelFor(\''+edId+'\')" onclick="openColorPopup(this,\''+edId+'\')">'
      +'<span class="color-dot" style="background:#004409;"></span>Cor'
      +'</button>'
      +'<div class="tb-sep"></div>'
      +'<button class="tb-btn" onmousedown="fmtCmd(event,\''+edId+'\',\'insertUnorderedList\')">• Lista</button>'
      +'<button class="tb-btn" onmousedown="fmtCmd(event,\''+edId+'\',\'insertOrderedList\')">1. Lista</button>'
      +'<div class="tb-sep"></div>'
      +'<button class="tb-btn" onmousedown="insertLinkFor(event,\''+edId+'\')">Link</button>';
  }

  /* ── ADD BLOCK ── */
  window.addBlock=function(){
    blockCount++;
    var id='block_'+blockCount, edId='ed_'+blockCount;
    var div=document.createElement('div');
    div.className='block-wrap'; div.id=id; div.dataset.align='left';
    div.innerHTML=
      '<div class="block-header">'
        +'<span class="block-label">Bloco '+blockCount+'</span>'
        +'<div class="block-header-right">'
          +'<button class="seg-btn active" onclick="setAlign(\''+id+'\',\'left\')">Esq</button>'
          +'<button class="seg-btn" onclick="setAlign(\''+id+'\',\'center\')">Centro</button>'
          +'<button class="seg-btn" onclick="setAlign(\''+id+'\',\'right\')">Dir</button>'
          +'<div class="tb-sep" style="height:16px;margin:0 3px;"></div>'
          +'<button class="block-remove" onclick="removeBlock(\''+id+'\')" title="Remover">&#10005;</button>'
        +'</div>'
      +'</div>'
      +'<div class="rich-toolbar">'+buildToolbar(edId)+'</div>'
      +'<div class="editor" id="'+edId+'" contenteditable="true"></div>';

    document.getElementById('blocksContainer').appendChild(div);

    var edVis = document.getElementById(edId);

    /* PASTE: sempre texto puro — formata no próprio editor */
    edVis.addEventListener('paste', function(e){
      e.preventDefault();
      var text = (e.clipboardData||window.clipboardData).getData('text/plain');
      // preservar quebras de linha como <br>
      var lines = text.split(/\r?\n/);
      var html = lines.map(function(l){ return l || ''; }).join('<br>');
      document.execCommand('insertHTML', false, html);
      updatePreview();
    });

    edVis.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        document.execCommand('insertLineBreak');
        updatePreview();
      }
    });

    edVis.addEventListener('input', function(){ updatePreview(); });

    edVis.focus();
    updatePreview();
  };

  window.setAlign=function(blockId,align){
    var block=document.getElementById(blockId);
    block.dataset.align=align;
    var map={'Esq':'left','Centro':'center','Dir':'right'};
    block.querySelectorAll('.seg-btn').forEach(function(b){var t=b.textContent.trim();if(map[t]!==undefined) b.classList.toggle('active',map[t]===align);});
    updatePreview();
  };

  window.removeBlock=function(blockId){var el=document.getElementById(blockId);if(el) el.parentNode.removeChild(el);updatePreview();};

  /* ── GENERATE HTML ── */
  function generateEmailHTML(){
    var previewText=val('previewText');
    var logoOn=checked('logoEnabled'),logoUrl=val('logoUrl'),logoLink=val('logoLink');
    var banner=val('bannerUrl'),bannerLnk=val('bannerLink');
    var titleOn=checked('titleEnabled'),titleTxt=val('titleText'),titleClr=val('titleColorHex')||'#242424';
    var btnOn=checked('btnEnabled'),btnTxt=val('btnText'),btnLnk=val('btnLink');
    var btnBg=val('btnBgHex')||'#2563eb',btnTxtClr=val('btnTxtHex')||'#242424',btnBorder=val('btnBorderHex')||'#000000';
    var btnTab=checked('btnNewTab');
    var bgExt=val('bgHex')||'#f0f0f0',cardVerde=val('cardVerdeHex')||'#1e293b';
    var cardBg=val('cardBgHex')||'#ffffff',cardBorder=val('cardBorderHex')||'#e1e1e6';
    var footerOn=checked('footerEnabled');
    var fLegal=val('footerLegal').replace(/\n/g,'<br />');
    var fLegalColor=val('footerLegalColorHex')||'#dadada';
    var fSocText=val('footerSocialText');
    var fSocColor=val('footerSocialColorHex')||'#ffffff';
    var fUnsub=val('footerUnsub');
    var fUnsubColor=val('footerUnsubColorHex')||'#999999';
    var fUnsubUrl=val('footerUnsubUrl')||'#';
    var instaOn=checked('instaOn'),instaUrl=val('instaUrl');
    var teleOn=checked('teleOn'),teleUrl=val('teleUrl');
    var ytOn=checked('ytOn'),ytUrl=val('ytUrl');

    var previewBlock=previewText
      ?'<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;" data-skip-in-text="true">'+esc(previewText)+'<div>'+Array(91).join('&zwnj;&nbsp;')+'</div></div>'
      :'';

    var logoCard='';
    if(logoOn&&logoUrl){
      var lImg='<img alt="Logo" src="'+logoUrl+'" style="display:inline-block;outline:none;border:none;text-decoration:none;max-width:100%;" width="250" />';
      var lInner=logoLink?'<a href="'+logoLink+'" target="_blank" style="display:inline-block;">'+lImg+'</a>':lImg;
      logoCard='<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto 10px;background-color:'+cardVerde+';color:#f0f0f0;border-radius:15px;overflow:hidden;"><tbody><tr style="width:100%"><td><h1 style="padding:10px 0 0;text-align:center;">'+lInner+'</h1></td></tr></tbody></table>';
    }

    var bannerCard='';
    if(banner){
      var bImg='<img alt="Banner" src="'+banner+'" style="display:block;outline:none;border:none;text-decoration:none;width:100%;height:auto;" width="600" />';
      var bInner=bannerLnk?'<a href="'+bannerLnk+'" target="_blank" style="display:block;">'+bImg+'</a>':bImg;
      bannerCard='<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto 10px;background-color:#eeeeee;color:#242424;border-radius:15px;border:1px solid '+cardVerde+';overflow:hidden;"><tbody><tr style="width:100%"><td><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:0;text-align:center;"><tbody><tr><td>'+bInner+'</td></tr></tbody></table></td></tr></tbody></table>';
    }

    var titleHtml=(titleOn&&titleTxt)
      ?'<p style="font-size:24px;line-height:150%;font-weight:900;margin-bottom:15px;text-align:center;margin-top:16px;color:'+titleClr+';">'+esc(titleTxt)+'</p>'
      :'';

    var blocksHtml='';
    document.querySelectorAll('.block-wrap').forEach(function(block){
      var edVis = block.querySelector('.editor');
      var content = edVis ? edVis.innerHTML.trim() : '';
      if(!content) return;
      blocksHtml+='<p style="font-size:16px;line-height:165%;font-weight:500;margin-top:16px;margin-bottom:16px;text-align:'+(block.dataset.align||'left')+';">'+content+'</p>';
    });

    var btnHtml=(btnOn&&btnTxt)
      ?'<div style="margin-top:30px;text-align:center;"><a href="'+(btnLnk||'#')+'"'+(btnTab&&btnLnk?' target="_blank"':'')+' style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:'+btnBg+';color:'+btnTxtClr+';font-weight:900;padding:12px 30px;font-size:16px;border-radius:10px;border:3px solid '+btnBorder+';text-transform:uppercase;"><span style="max-width:100%;display:inline-block;line-height:120%;">'+esc(btnTxt)+'</span></a></div>'
      :'';

    var footerCard='';
    if(footerOn){
      var socCells='';
      if(instaOn) socCells+='<td style="padding:0 15px;"><a href="'+(instaUrl||'#')+'" target="_blank" rel="noopener noreferrer"><img alt="Instagram" src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" style="display:block;outline:none;border:none;text-decoration:none;border-radius:100%;" width="35" /></a></td>';
      if(teleOn)  socCells+='<td style="padding:0 15px;"><a href="'+(teleUrl||'#')+'"  target="_blank" rel="noopener noreferrer"><img alt="Telegram"  src="https://cdn-icons-png.flaticon.com/512/2111/2111644.png" style="display:block;outline:none;border:none;text-decoration:none;border-radius:10%;"  width="30" /></a></td>';
      if(ytOn)    socCells+='<td style="padding:0 15px;"><a href="'+(ytUrl||'#')+'"    target="_blank" rel="noopener noreferrer"><img alt="YouTube"   src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" style="display:block;outline:none;border:none;text-decoration:none;border-radius:10%;"  width="35" /></a></td>';

      footerCard='<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto 10px;background-color:'+cardVerde+';color:#f0f0f0;border-radius:15px;overflow:hidden;"><tbody><tr style="width:100%"><td>'
        +'<p style="font-size:14px;line-height:24px;color:'+fLegalColor+';margin-top:20px;margin-bottom:10px;text-align:center;padding-inline:40px;">'+fLegal+'</p>'
        +(socCells?
          '<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="text-align:center;"><tbody><tr><td>'
          +'<p style="font-size:15px;line-height:24px;color:'+fSocColor+';margin-bottom:16px;padding-inline:40px;margin-top:16px;">'+esc(fSocText)+'</p>'
          +'<table style="margin:0 auto" cellpadding="0" cellspacing="0" role="presentation"><tr>'+socCells+'</tr></table>'
          +'</td></tr></tbody></table>'
          :'')
        +'<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:12px 10px;text-align:center;"><tbody><tr><td>'
        +'<p style="font-size:12px;line-height:24px;color:'+fUnsubColor+';margin-top:16px;margin-bottom:16px;">'+esc(fUnsub)+' <a href="'+fUnsubUrl+'" style="color:'+fUnsubColor+';text-decoration:underline;">clique aqui</a>.</p>'
        +'</td></tr></tbody></table>'
        +'</td></tr></tbody></table>';
    }

    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
      +'<html style="margin:0;padding:0" dir="ltr" lang="pt-BR">'
      +'<head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type" /><meta name="x-apple-disable-message-reformatting" />'
      +'<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&amp;display=swap" rel="stylesheet" /></head>'
      +'<body style="background-color:'+bgExt+'">'
      +previewBlock
      +'<table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center"><tbody><tr>'
      +'<td style="margin:0;padding:0;padding-top:50px;padding-bottom:50px;background-color:'+bgExt+';font-family:\'Inter\',Arial,sans-serif;">'
      +logoCard+bannerCard
      +'<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto 10px;background-color:'+cardBg+';color:#242424;border-radius:15px;border:1px solid '+cardBorder+';overflow:hidden;">'
      +'<tbody><tr style="width:100%"><td>'
      +'<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 25px;">'
      +'<tbody><tr><td>'+titleHtml+blocksHtml+btnHtml+'</td></tr></tbody></table>'
      +'</td></tr></tbody></table>'
      +footerCard
      +'</td></tr></tbody></table>'
      +'</body></html>';
  }

  /* ── PREVIEW via Blob URL ── */
  window.updatePreview = function(){
    var html = generateEmailHTML();
    var frame = document.getElementById('previewFrame');

    if(currentBlobUrl){ URL.revokeObjectURL(currentBlobUrl); currentBlobUrl = null; }
    var blob = new Blob([html], {type:'text/html;charset=utf-8'});
    currentBlobUrl = URL.createObjectURL(blob);

    frame.onload = function(){
      try{
        var doc = frame.contentDocument || frame.contentWindow.document;
        var h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
        frame.style.height = h + 'px';
      }catch(e){
        setTimeout(function(){
          try{
            var doc2 = frame.contentDocument || frame.contentWindow.document;
            frame.style.height = Math.max(doc2.body.scrollHeight, doc2.documentElement.scrollHeight) + 'px';
          }catch(e2){}
        }, 100);
      }
    };
    frame.src = currentBlobUrl;
  };

  /* ── COPY ── */
  window.copyHTML=function(){
    navigator.clipboard.writeText(generateEmailHTML()).then(function(){
      var btn=document.getElementById('btnCopy');
      btn.classList.add('copied'); btn.textContent='Copiado!';
      setTimeout(function(){
        btn.classList.remove('copied');
        btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copiar HTML';
      },2500);
    });
  };

  /* ── DEFAULTS ── */
  function applyDefaults(){
    // Logo genérica
    document.getElementById('logoUrl').value = 'https://via.placeholder.com/200x60/1e293b/ffffff?text=Sua+Logo';
    document.getElementById('logoLink').value = '';

    // Banner vazio
    document.getElementById('bannerUrl').value = '';
    document.getElementById('bannerLink').value = '';

    // Título
    document.getElementById('titleText').value = 'Seu titulo aqui';
    document.getElementById('titleColorHex').value = '#242424';
    document.getElementById('titleColor').value = '#242424';

    // Preview text
    document.getElementById('previewText').value = '';

    // Botão CTA — pré-ativado com texto padrão
    document.getElementById('btnText').value = 'Botão';
    document.getElementById('btnLink').value = '';
    document.getElementById('btnBgHex').value = '#2563eb';
    document.getElementById('btnBgColor').value = '#2563eb';
    document.getElementById('btnTxtHex').value = '#ffffff';
    document.getElementById('btnTxtColor').value = '#ffffff';
    document.getElementById('btnBorderHex').value = '#1d4ed8';
    document.getElementById('btnBorderColor').value = '#1d4ed8';
    document.getElementById('btnNewTab').checked = true;

    // Cores globais
    document.getElementById('bgHex').value = '#f0f0f0';
    document.getElementById('bgColor').value = '#f0f0f0';
    document.getElementById('cardVerdeHex').value = '#1e293b';
    document.getElementById('cardVerdeColor').value = '#1e293b';
    document.getElementById('cardBgHex').value = '#ffffff';
    document.getElementById('cardBgColor').value = '#ffffff';
    document.getElementById('cardBorderHex').value = '#e1e1e6';
    document.getElementById('cardBorderColor').value = '#e1e1e6';

    // Rodapé
    document.getElementById('footerLegal').value = 'Este e-mail foi enviado para voce porque voce se cadastrou em nossa lista.\n© 2025 Sua Empresa. Todos os direitos reservados.';
    autoResize(document.getElementById('footerLegal'));
    document.getElementById('footerSocialText').value = 'Siga nossas redes sociais!';
    document.getElementById('footerUnsub').value = 'Para cancelar o recebimento destes e-mails,';
    document.getElementById('footerUnsubUrl').value = '';
    document.getElementById('footerLegalColorHex').value = '#dadada';
    document.getElementById('footerLegalColor').value = '#dadada';
    document.getElementById('footerSocialColorHex').value = '#ffffff';
    document.getElementById('footerSocialColor').value = '#ffffff';
    document.getElementById('footerUnsubColorHex').value = '#999999';
    document.getElementById('footerUnsubColor').value = '#999999';

    // Redes sociais pré-selecionadas (sem URL — aparece o ícone mesmo assim no preview)
    document.getElementById('instaUrl').value = '';
    document.getElementById('teleUrl').value = '';
    document.getElementById('ytUrl').value = '';

    // Checkboxes
    ['logoEnabled','titleEnabled','footerEnabled','btnEnabled','instaOn','teleOn','ytOn'].forEach(function(id){
      document.getElementById(id).checked = true;
    });

    // Aplicar toggles visuais
    toggleOpt('logoEnabled','logoFields','logoBlock');
    toggleOpt('titleEnabled','titleFields','titleBlock');
    toggleOpt('btnEnabled','btnFields','btnBlock');
    toggleOpt('footerEnabled','footerFields','footerBlock');
  }

  var DEFAULT_BLOCK_TEXT = 'Olá! Escreva aqui o conteúdo do seu e-mail. Você pode usar <b>negrito</b>, <i>itálico</i>, listas e muito mais.<br><br>Adicione quantos blocos de texto quiser usando o botão abaixo.';

  function resetToDefaults(){
    // pausar auto-save durante o reset
    var paused = true;
    var origUpdate = window.updatePreview;
    window.updatePreview = function(){ if(!paused) origUpdate(); };

    applyDefaults();
    document.getElementById('blocksContainer').innerHTML = '';
    blockCount = 0;
    addBlock();
    var ed = document.getElementById('ed_' + blockCount);
    if(ed) ed.innerHTML = DEFAULT_BLOCK_TEXT;

    // retomar e disparar uma única vez
    paused = false;
    window.updatePreview = origUpdate;
    origUpdate();
  }

  /* ── NOVO EMAIL ── */
  window.novoEmail = function(){
    if(!confirm('Resetar tudo e começar um novo e-mail?')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch(e){}
    resetToDefaults();
  };

  /* ── AUTO-SAVE / RESTORE ── */
  var SAVE_KEY = 'emailgen_state';
  var saveTimer = null;

  // Lista de todos os campos simples a salvar
  var FIELDS = [
    'previewText','logoUrl','logoLink','bannerUrl','bannerLink',
    'titleText','titleColorHex',
    'btnText','btnLink','btnBgHex','btnTxtHex','btnBorderHex',
    'bgHex','cardVerdeHex','cardBgHex','cardBorderHex',
    'footerLegal','footerSocialText','footerSocialColorHex',
    'footerLegalColorHex','footerUnsub','footerUnsubColorHex','footerUnsubUrl',
    'instaUrl','teleUrl','ytUrl'
  ];
  var CHECKS = [
    'logoEnabled','titleEnabled','btnEnabled','btnNewTab',
    'footerEnabled','instaOn','teleOn','ytOn'
  ];

  function saveState() {
    var state = { fields: {}, checks: {}, blocks: [] };

    FIELDS.forEach(function(id){
      var el = document.getElementById(id);
      if(el) state.fields[id] = el.value;
    });
    CHECKS.forEach(function(id){
      var el = document.getElementById(id);
      if(el) state.checks[id] = el.checked;
    });

    // salvar blocos de texto
    document.querySelectorAll('.block-wrap').forEach(function(block){
      var ed = block.querySelector('.editor');
      state.blocks.push({
        align: block.dataset.align || 'left',
        content: ed ? ed.innerHTML : ''
      });
    });

    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e){}

    // mostrar indicador
    var badge = document.getElementById('saveBadge');
    if(badge){ badge.classList.add('show'); clearTimeout(badge._t); badge._t = setTimeout(function(){ badge.classList.remove('show'); }, 2000); }
  }

  function restoreState() {
    var raw;
    try { raw = localStorage.getItem(SAVE_KEY); } catch(e){}
    if(!raw) return false;

    var state;
    try { state = JSON.parse(raw); } catch(e){ return false; }

    // restaurar campos
    (state.fields ? Object.keys(state.fields) : []).forEach(function(id){
      var el = document.getElementById(id);
      if(el){ el.value = state.fields[id]; }
    });

    // sincronizar color pickers com os hex
    ['btnBgHex','btnTxtHex','btnBorderHex','bgHex','cardVerdeHex','cardBgHex',
     'cardBorderHex','titleColorHex','footerLegalColorHex','footerSocialColorHex','footerUnsubColorHex'].forEach(function(hexId){
      var colorId = hexId.replace('Hex','');
      var hexEl = document.getElementById(hexId);
      var colorEl = document.getElementById(colorId);
      if(hexEl && colorEl && /^#[0-9a-fA-F]{6}$/.test(hexEl.value)) colorEl.value = hexEl.value;
    });

    // restaurar checkboxes
    (state.checks ? Object.keys(state.checks) : []).forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.checked = state.checks[id];
    });

    // aplicar toggles visuais
    toggleOpt('logoEnabled','logoFields','logoBlock');
    toggleOpt('titleEnabled','titleFields','titleBlock');
    toggleOpt('btnEnabled','btnFields','btnBlock');
    toggleOpt('footerEnabled','footerFields','footerBlock');

    // auto-resize textareas
    document.querySelectorAll('textarea').forEach(function(t){ autoResize(t); });

    // restaurar blocos
    document.getElementById('blocksContainer').innerHTML = '';
    blockCount = 0;
    if(state.blocks && state.blocks.length > 0){
      state.blocks.forEach(function(b){
        addBlock();
        var wrap = document.getElementById('block_' + blockCount);
        var ed = document.getElementById('ed_' + blockCount);
        if(ed) ed.innerHTML = b.content;
        if(wrap) wrap.dataset.align = b.align;
        // atualizar botões de alinhamento
        if(wrap) setAlign('block_' + blockCount, b.align);
      });
    } else {
      addBlock();
    }

    return true;
  }

  // disparar save com debounce após qualquer updatePreview
  var _origUpdatePreview;
  function hookSave(){
    _origUpdatePreview = window.updatePreview;
    window.updatePreview = function(){
      _origUpdatePreview();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveState, 800);
    };
  }

  /* ── INIT ── */
  window.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('textarea').forEach(function(t){ autoResize(t); });
    hookSave();
    var restored = restoreState();
    if(!restored) resetToDefaults();
    else updatePreview();
  });

}());