// Cole este arquivo em Extensões > Apps Script, dentro da sua planilha.
function configurar() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!sheet) throw new Error('Abra o Apps Script pelo menu Extensões da planilha.');
  var props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', sheet.getId());
  prepararAba_(sheet);
  console.log('Aba Contatos pronta. Publique uma nova versão do aplicativo da Web.');
}

function prepararAba_(book) {
  var sheet = book.getSheetByName('Contatos') || book.insertSheet('Contatos');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Recebido em', 'Nome', 'WhatsApp', 'Tipo de site', 'Mensagem', 'Status', 'Observações', 'Consentimento']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 9).setBackground('#172b25').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(6, 360);
    sheet.setColumnWidth(8, 280);
    sheet.setColumnWidth(2, 165);
  }
  return sheet;
}

function textoSeguro_(value) {
  var text = String(value || '');
  return /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
}

function resposta_(value) {
  var safe = {channel: 'dg-contatos', ok: value.ok === true, id: /^[a-zA-Z0-9-]{16,80}$/.test(value.id || '') ? value.id : ''};
  var json = JSON.stringify(safe).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><p>' + (safe.ok ? 'Solicitação recebida.' : 'Não foi possível salvar.') + '</p><script>window.top.postMessage(' + json + ', "*");</script></body></html>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var lock;
  var id = '';
  try {
    var raw = e && e.parameter && e.parameter.payload;
    if (!raw || raw.length > 7000) return resposta_({ ok: false, id: id });
    var data = JSON.parse(raw);
    id = data.id || '';
    var props = PropertiesService.getScriptProperties();
    if (data.website) return resposta_({ ok: false, id: id });
    if (typeof data.id !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(data.id) ||
        typeof data.nome !== 'string' || !data.nome.trim() || data.nome.length > 80 ||
        typeof data.telefone !== 'string' || data.telefone.length > 20 || !/^\d{10,13}$/.test(data.telefone.replace(/\D/g, '')) ||
        ['Landing page', 'Site profissional', 'Sistema digital', 'Não sei ainda'].indexOf(data.tipo) < 0 ||
        typeof data.mensagem !== 'string' || data.mensagem.length > 600 || data.consentimento !== true) return resposta_({ ok: false, id: id });
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    var sheet = prepararAba_(SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')));
    if (sheet.getLastRow() > 1 && sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(data.id).matchEntireCell(true).findNext()) {
      return resposta_({ ok: true, id: data.id });
    }
    var row = sheet.getLastRow() + 1;
    sheet.getRange(row, 4).setNumberFormat('@');
    sheet.getRange(row, 1, 1, 9).setValues([[data.id, new Date(), textoSeguro_(data.nome), textoSeguro_(data.telefone), data.tipo, textoSeguro_(data.mensagem), 'Novo', '', 'Solicitou contato ao enviar o formulário']]);
    sheet.getRange(row, 2).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    SpreadsheetApp.flush();
    return resposta_({ ok: true, id: data.id });
  } catch (error) {
    return resposta_({ ok: false, id: id });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
