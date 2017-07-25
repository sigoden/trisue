const VALID_PARAM_KEYS = ['method', 'path', 'describe', 'header', 'reqBody', 'resBody']

let $tbRecords

function formatTime (time) {
  let d = new Date(time)
  return  d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' +
    d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
}

function genUrl(params) {
  return location.origin + '?' + $.param(filterParams(params))
}

function filterParams(params) {
  let result = {}
  for (let key of VALID_PARAM_KEYS) {
    result[key] = params[key]
  }
  return result
}

function drawRow(rowData) {
  let row = $(`
          <tr data-id="${rowData.id}">
            <td><code>${rowData.method}</code>${rowData.path}</td>
            <td>${formatTime(rowData.id)}</td>
            <td>
              <div class="btn-group" role="group">
                <a type="button" class="btn btn-sm btn-secondary" target="_blank" href="${genUrl(rowData)}">
                  <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                </a>
                <button type="button" class="btn btn-sm btn-secondary" id="btnRemove" data-id="${rowData.id}">
                  <i class="fa fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
  `)
  $tbRecords.append(row)
}

function onRemove($btn) {
  let id = $btn.data('id')
  $(`tr[data-id="${id}"]`).remove()
  MyStorage.removeRecord(id)
}

$(function () {
  let records = MyStorage.records
  $tbRecords = $('#tbRecords')
  records.forEach(rowData => drawRow(rowData))
  $('#btnRemove').on('click', function() {
    onRemove($(this))
  })
})
