const ID_PREFIX = 'my'
const VALID_PARAM_KEYS = ['method', 'path', 'describe', 'header', 'reqBody', 'resBody']
const CONFIG = MyStorage.config

let $myResBody, $grpTry, $grpRetry
let isVirginURL = true

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function prettyJSON(str) {
  try {
    return JSON.stringify(JSON.parse(str), null, 4)
  } catch (e) {
    return str
  }
}

function compactJSON(str) {
  try {
    return JSON.stringify(JSON.parse(str))
  } catch (e) {
    return str
  }
}

function patternReplace(str, prefix, suffix) {
  let patterns = CONFIG.patterns || {}
  for (let key in patterns) {
    str = str.replace(new RegExp(prefix + key + suffix, 'g'), patterns[key])
  }
  return str
}


$(function(){
  reuseElement()
  populateForm()
  bindEvents()
  autosize($('textarea'))
})

function reuseElement() {
  $myResBody = $(`#${ID_PREFIX}ResBody`)
  $grpTry = $('#grpTry')
  $grpRetry = $('#grpRetry')
}

function populateForm() {
  const urlParams = $.url().data.param.query
  for (let key in urlParams) {
    if (VALID_PARAM_KEYS.indexOf(key) >  -1 && urlParams[key]) {
      $(`#${ID_PREFIX}${capitalize(key)}`).val(prettyJSON(urlParams[key]))
    }
  }
  if (!urlParams['header']) {
    $(`#${ID_PREFIX}Header`).val(CONFIG.defaultHeader)
  }
  if (urlParams['resBody']) {
    $grpTry.hide()
    $grpRetry.show()
  }
}

function bindEvents() {
  $('#btnTry').click(request)
  $('#btnRetry').click(request)
  $('#btnClearRes').click(onClearRes)
  $('#btnGenUrl').click(onGenUrl)
}

function collectParams() {
  let params = {}
  for (let key of VALID_PARAM_KEYS) {
    params[key] = compactJSON($(`#${ID_PREFIX}${capitalize(key)}`).val())
  }
  return params
}

function request() {
  let params = collectParams()
  let headers = headerProc(params.header)
  let data = reqBodyProc(headers['content-type'], params.reqBody)
  $.ajax({
    url: params.path,
    headers,
    data,
    timeout: CONFIG.reqTimeout || 0,
    success: function (data) {
      onRequest(JSON.stringify(data, null, 4))
    },
    error: function (xhr) {
      onRequest(xhr.responseText)
    }
  })
}

function headerProc(header) {
  header = patternReplace(header, '{{', '}}')
  let result = {}
  header.trim().split('\n').forEach(v => {
    let key, value
    if ((i = v.indexOf(':')) > -1) {
      key = v.slice(0, i).toLowerCase()
      value = v.slice(i+1).trim()
      result[key] = value
    }
  })
  if (!result['content-type']) {
    result['content-type'] = 'application/json'
  }
  return result
}

function reqBodyProc(contentType, data) {
  data = patternReplace(data, '{{', '}}')
  let result = data
  if (contentType === 'application/json') {
    try {
      result = JSON.parse(data)
    } catch(e) { }
  } else if (contentType === 'application/x-www-form-urlencoded') {
    try {
      parsed = JSON.parse(data)
      result = $.param(parsed)
    } catch(e) { }
  }
  return result
}

function onRequest(value) {
  autosize.update($myResBody.val(value))
  $grpTry.hide()
  $grpRetry.show()
  let params = collectParams()
  changeUrlBar(params)
  MyStorage.addRecord(params)
}

function onGenUrl() {
  let params = collectParams()
  changeUrlBar(params)
}

function onClearRes() {
  $myResBody.val('')
  $grpTry.show()
  $grpRetry.hide()
}

function changeUrlBar(params) {
  let url = genUrl(params)
  url = patternReplace(url, '%7B%7B', '%7D%7D')
  if (isVirginURL) {
    history.pushState({}, '', url)
  } else {
    isVirginURL = false
    history.replaceState({}, '', url)
  }
}

function genUrl(params) {
  let attr = $.url().data.attr
  return attr.base + attr.path + '?' + $.param(params)
}
